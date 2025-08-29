import React, { useState, useRef, useEffect } from 'react';
import { FaPlus, FaTrash, FaFilePdf, FaEnvelope, FaCheck } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import emailjs from '@emailjs/browser';

// EmailJS configuration
const EMAILJS_SERVICE_ID = 'service_smarthospital'; // Your EmailJS service ID
const EMAILJS_TEMPLATE_ID = 'template_prescription'; // Your EmailJS template ID
const EMAILJS_PUBLIC_KEY = 'F5-YourPublicKey-Replace'; // Your EmailJS public key

// Common medicine options
const COMMON_MEDICINES = [
  // Pain and Fever
  'Paracetamol 500mg',
  'Paracetamol 650mg',
  'Ibuprofen 400mg',
  'Ibuprofen 600mg',
  'Diclofenac 50mg',
  'Tramadol 50mg',
  
  // Antibiotics
  'Amoxicillin 500mg',
  'Azithromycin 500mg',
  'Ciprofloxacin 500mg',
  'Doxycycline 100mg',
  'Cefixime 200mg',
  'Augmentin 625mg',
  
  // Antacids and Digestive
  'Pantoprazole 40mg',
  'Omeprazole 20mg',
  'Ranitidine 150mg',
  'Domperidone 10mg',
  'Ondansetron 4mg',
  'Dicyclomine 20mg',
  
  // Antiallergics
  'Cetirizine 10mg',
  'Levocetirizine 5mg',
  'Montelukast 10mg',
  'Chlorpheniramine 4mg',
  'Fexofenadine 120mg',
  'Desloratadine 5mg',
  
  // Cardiovascular
  'Amlodipine 5mg',
  'Amlodipine 10mg',
  'Atenolol 50mg',
  'Aspirin 75mg',
  'Clopidogrel 75mg',
  'Telmisartan 40mg',
  'Rosuvastatin 10mg',
  
  // Diabetes
  'Metformin 500mg',
  'Metformin 1000mg',
  'Glimepiride 1mg',
  'Glimepiride 2mg',
  'Vildagliptin 50mg',
  'Insulin Regular',
  
  // Vitamins and Supplements
  'Vitamin D3 60000IU',
  'Vitamin B12 1500mcg',
  'Calcium + Vitamin D3',
  'Multivitamin tablet',
  'Iron + Folic Acid',
  'Zinc 20mg',
  
  // Respiratory
  'Salbutamol inhaler',
  'Budesonide inhaler',
  'Montelukast 10mg',
  'Dextromethorphan syrup',
  'Bromhexine 8mg',
  
  // Mental Health
  'Alprazolam 0.25mg',
  'Alprazolam 0.5mg',
  'Escitalopram 10mg',
  'Sertraline 50mg'
];

// Common quantities
const COMMON_QUANTITIES = [
  // Tablets/Capsules
  '1 tablet',
  '2 tablets',
  '½ tablet',
  '¼ tablet',
  '1 capsule',
  '2 capsules',
  
  // Liquid Medications
  '2.5ml',
  '5ml',
  '10ml',
  '15ml',
  '20ml',
  '1 teaspoon',
  '2 teaspoons',
  '1 tablespoon',
  
  // Injections
  '1 ampule',
  '1 vial',
  '0.5ml',
  '1ml',
  '2ml',
  '3ml',
  
  // Topical
  'Apply thin layer',
  'Apply liberally',
  'Small amount',
  'Fingertip unit',
  
  // Inhalers
  '1 puff',
  '2 puffs',
  '3 puffs',
  '4 puffs',
  
  // Drops
  '1 drop',
  '2 drops',
  '3 drops',
  '4 drops',
  '5 drops'
];

// Common durations
const COMMON_DURATIONS = [
  // Short term
  '1 day',
  '2 days',
  '3 days',
  '5 days',
  '7 days',
  '10 days',
  '2 weeks',
  
  // Medium term
  '3 weeks',
  '1 month',
  '45 days',
  '2 months',
  '3 months',
  
  // Long term
  '6 months',
  '1 year',
  'Ongoing',
  
  // Special cases
  'As needed (SOS)',
  'Until finished',
  'Single dose only',
  'Once weekly',
  'Twice weekly',
  'Once monthly'
];

const PrescriptionGenerator = ({ patient }) => {
  const { translate } = useLanguage();
  const [medicines, setMedicines] = useState([]);
  const [newMedicine, setNewMedicine] = useState({
    name: '',
    quantity: '',
    timing: 'before', // 'before' or 'after'
    frequency: 'daily', // 'daily', 'twice', 'thrice'
    duration: '',
    instructions: ''
  });
  const [isSending, setIsSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);
  const [diagnosisNotes, setDiagnosisNotes] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const formRef = useRef();

  // Initialize EmailJS
  useEffect(() => {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }, []);

  const addMedicine = () => {
    if (newMedicine.name && newMedicine.quantity) {
      setMedicines([...medicines, { ...newMedicine, id: Date.now() }]);
      setNewMedicine({
        name: '',
        quantity: '',
        timing: 'before',
        frequency: 'daily',
        duration: '',
        instructions: ''
      });
    }
  };

  const removeMedicine = (id) => {
    setMedicines(medicines.filter(med => med.id !== id));
  };

  const generatePDF = () => {
    if (medicines.length === 0) {
      alert('Please add at least one medicine to the prescription.');
      return;
    }
    
    const doc = new jsPDF();
    
    // Add Hospital Logo and Header
    doc.setFontSize(22);
    doc.setTextColor(0, 102, 204);
    doc.text('SMART HOSPITAL', 105, 15, null, null, 'center');
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Medical Prescription', 105, 25, null, null, 'center');
    
    // Add divider line
    doc.setDrawColor(0, 102, 204);
    doc.setLineWidth(0.5);
    doc.line(20, 30, 190, 30);
    
    // Add date and prescription number
    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 40);
    doc.text(`Prescription #: PRESC-${Math.floor(Math.random() * 10000)}`, 150, 40);
    
    // Add patient details
    doc.setFontSize(12);
    doc.text(`Patient: ${patient.name}`, 20, 50);
    doc.text(`Treatment: ${patient.treatment || 'General Consultation'}`, 20, 58);
    
    // Add doctor details
    doc.text('Doctor: Dr. John Doe', 120, 50);
    doc.text('Specialization: Cardiologist', 120, 58);
    
    // Add diagnosis if entered
    if (diagnosisNotes) {
      doc.setFontSize(12);
      doc.text('Diagnosis:', 20, 70);
      
      // Calculate how many lines needed for diagnosis
      const maxWidth = 170;
      const textLines = doc.splitTextToSize(diagnosisNotes, maxWidth);
      
      doc.setFontSize(10);
      let yPos = 78;
      textLines.forEach(line => {
        doc.text(line, 25, yPos);
        yPos += 6;
      });
      
      // Adjust starting position for the table
      var tableStartY = yPos + 5;
    } else {
      var tableStartY = 75;
    }
    
    // Create table data
    const tableData = [
      ['Medicine', 'Quantity', 'Timing', 'Frequency', 'Duration', 'Instructions'],
      ...medicines.map(med => [
        med.name,
        med.quantity,
        med.timing === 'before' ? 'Before Food' : med.timing === 'after' ? 'After Food' : med.timing === 'with' ? 'With Food' : med.timing === 'empty' ? 'Empty Stomach' : med.timing === 'bedtime' ? 'At Bedtime' : med.timing === 'morning' ? 'Morning' : 'Night',
        med.frequency === 'daily' ? 'Once daily' : med.frequency === 'twice' ? 'Twice daily' : med.frequency === 'thrice' ? 'Thrice daily' : med.frequency === 'four' ? 'Four times a day' : med.frequency === 'sos' ? 'As needed (SOS)' : med.frequency === 'weekly' ? 'Once a week' : med.frequency === 'biweekly' ? 'Twice a week' : med.frequency === 'monthly' ? 'Once a month' : med.frequency === 'hourly' ? 'Every 6 hours' : med.frequency === 'stat' ? 'Immediately (STAT)' : 'Unknown',
        med.duration,
        med.instructions
      ])
    ];
    
    // Add table to PDF
    doc.autoTable({
      startY: tableStartY,
      head: [tableData[0]],
      body: tableData.slice(1),
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 5 },
      headStyles: { fillColor: [0, 102, 204], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] },
    });
    
    // Add signature
    const finalY = doc.previousAutoTable.finalY + 20;
    doc.text('Doctor\'s Signature:', 150, finalY);
    
    // Add a placeholder for signature
    doc.setDrawColor(0);
    doc.setLineWidth(0.2);
    doc.line(150, finalY + 15, 190, finalY + 15);
    
    // Add footer
    doc.setFontSize(8);
    doc.text('This is a computer-generated prescription and doesn\'t require a physical signature.', 105, doc.internal.pageSize.height - 15, null, null, 'center');
    doc.text('Smart Hospital | Address: 123 Medical Avenue, Healthcare City | Phone: (123) 456-7890', 105, doc.internal.pageSize.height - 10, null, null, 'center');
    
    // Add QR code (placeholder)
    doc.rect(20, finalY - 10, 30, 30);
    doc.setFontSize(6);
    doc.text('Scan for digital verification', 35, finalY + 25, null, null, 'center');
    
    // Save the PDF with patient name
    const sanitizedName = patient.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `${sanitizedName}_prescription_${dateStr}.pdf`;
    doc.save(filename);
    
    return doc; // Return the doc object for email sending
  };

  const sendEmail = async (e) => {
    if (e) e.preventDefault();
    
    if (medicines.length === 0) {
      setEmailStatus({ type: 'error', message: 'Please add at least one medicine to the prescription.' });
      return;
    }
    
    if (!patientEmail) {
      setEmailStatus({ type: 'error', message: 'Please enter patient email address.' });
      return;
    }

    setIsSending(true);
    setEmailStatus(null);

    try {
      // Generate PDF
      const doc = generatePDF();
      
      // Convert PDF to base64
      const pdfBase64 = doc.output('datauristring');
      
      // Create medicine summary for email body
      const medicineList = medicines.map(med => 
        `- ${med.name} (${med.quantity}): ${med.timing === 'before' ? 'Before' : med.timing === 'after' ? 'After' : med.timing === 'with' ? 'With' : med.timing === 'empty' ? 'Empty Stomach' : med.timing === 'bedtime' ? 'At Bedtime' : med.timing === 'morning' ? 'Morning' : 'Night'}, ` +
        `${med.frequency === 'daily' ? 'Once daily' : med.frequency === 'twice' ? 'Twice daily' : med.frequency === 'thrice' ? 'Thrice daily' : med.frequency === 'four' ? 'Four times a day' : med.frequency === 'sos' ? 'As needed (SOS)' : med.frequency === 'weekly' ? 'Once a week' : med.frequency === 'biweekly' ? 'Twice a week' : med.frequency === 'monthly' ? 'Once a month' : med.frequency === 'hourly' ? 'Every 6 hours' : med.frequency === 'stat' ? 'Immediately (STAT)' : 'Unknown'}, ` +
        `for ${med.duration}${med.instructions ? '. ' + med.instructions : ''}`
      ).join('\n');
      
      // Prepare email template parameters
      const templateParams = {
        to_email: patientEmail,
        to_name: patient.name,
        from_name: 'Dr. John Doe',
        hospital_name: 'Smart Hospital',
        prescription_date: new Date().toLocaleDateString(),
        diagnosis: diagnosisNotes || 'General consultation',
        medicine_list: medicineList,
        prescription_pdf: pdfBase64
      };

      // Send email using EmailJS
      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
      );

      console.log('Email sent successfully:', response);
      setEmailStatus({ 
        type: 'success', 
        message: `Prescription sent successfully to ${patientEmail}!` 
      });
      setEmailSent(true);
    } catch (error) {
      console.error('Error sending email:', error);
      setEmailStatus({ 
        type: 'error', 
        message: `Failed to send prescription: ${error.message}. Please check your EmailJS configuration.` 
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md max-w-full overflow-hidden">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Generate Prescription</h2>
      
      <form ref={formRef} onSubmit={sendEmail} className="space-y-4 sm:space-y-6">
        {/* Patient Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Patient Email Address <span className="text-red-500">*</span></label>
          <input
            type="email"
            value={patientEmail}
            onChange={(e) => setPatientEmail(e.target.value)}
            className="w-full p-2 border rounded text-sm sm:text-base"
            placeholder="patient@example.com"
            required
          />
        </div>
        
        {/* Diagnosis Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis Notes</label>
          <textarea
            value={diagnosisNotes}
            onChange={(e) => setDiagnosisNotes(e.target.value)}
            className="w-full p-2 border rounded text-sm sm:text-base"
            rows="3"
            placeholder="Enter diagnosis notes..."
          />
        </div>
        
        {/* Medicine List */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Medicines</h3>
          
          {/* Add New Medicine Form */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                list="medicineNames"
                value={newMedicine.name}
                onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })}
                className="w-full p-2 border rounded text-sm sm:text-base"
                placeholder="Enter medicine name"
              />
              <datalist id="medicineNames">
                {COMMON_MEDICINES.map((med, index) => (
                  <option key={index} value={med} />
                ))}
              </datalist>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  list="quantities"
                  value={newMedicine.quantity}
                  onChange={(e) => setNewMedicine({ ...newMedicine, quantity: e.target.value })}
                  className="w-full p-2 border rounded text-sm sm:text-base"
                  placeholder="Enter quantity"
                />
                <datalist id="quantities">
                  {COMMON_QUANTITIES.map((qty, index) => (
                    <option key={index} value={qty} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <input
                  type="text"
                  list="durations"
                  value={newMedicine.duration}
                  onChange={(e) => setNewMedicine({ ...newMedicine, duration: e.target.value })}
                  className="w-full p-2 border rounded text-sm sm:text-base"
                  placeholder="Enter duration"
                />
                <datalist id="durations">
                  {COMMON_DURATIONS.map((duration, index) => (
                    <option key={index} value={duration} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timing</label>
                <select
                  value={newMedicine.timing}
                  onChange={(e) => setNewMedicine({...newMedicine, timing: e.target.value})}
                  className="w-full p-2 border rounded text-sm sm:text-base"
                >
                  <option value="before">Before Food</option>
                  <option value="after">After Food</option>
                  <option value="with">With Food</option>
                  <option value="empty">Empty Stomach</option>
                  <option value="bedtime">At Bedtime</option>
                  <option value="morning">Morning</option>
                  <option value="night">Night</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                <select
                  value={newMedicine.frequency}
                  onChange={(e) => setNewMedicine({...newMedicine, frequency: e.target.value})}
                  className="w-full p-2 border rounded text-sm sm:text-base"
                >
                  <option value="daily">Once a day</option>
                  <option value="twice">Twice a day</option>
                  <option value="thrice">Thrice a day</option>
                  <option value="four">Four times a day</option>
                  <option value="sos">As needed (SOS)</option>
                  <option value="weekly">Once a week</option>
                  <option value="biweekly">Twice a week</option>
                  <option value="monthly">Once a month</option>
                  <option value="hourly">Every 6 hours</option>
                  <option value="stat">Immediately (STAT)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
              <input
                type="text"
                value={newMedicine.instructions}
                onChange={(e) => setNewMedicine({...newMedicine, instructions: e.target.value})}
                className="w-full p-2 border rounded text-sm sm:text-base"
                placeholder="Special instructions"
              />
            </div>
          </div>
          
          <button
            type="button"
            onClick={addMedicine}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-flex items-center text-sm sm:text-base"
          >
            <FaPlus className="mr-2" />
            Add Medicine
          </button>
        </div>

        {/* Medicines List */}
        {medicines.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Prescribed Medicines</h3>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden border rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Freq</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                        <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {medicines.map((med) => (
                        <tr key={med.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 whitespace-nowrap text-sm">{med.name}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">{med.quantity}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">{med.timing === 'before' ? 'Before' : med.timing === 'after' ? 'After' : med.timing === 'with' ? 'With' : med.timing === 'empty' ? 'Empty' : med.timing === 'bedtime' ? 'Bedtime' : med.timing === 'morning' ? 'Morning' : 'Night'}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">
                            {med.frequency === 'daily' ? '1/day' : 
                            med.frequency === 'twice' ? '2/day' : 
                            med.frequency === 'thrice' ? '3/day' : 
                            med.frequency === 'four' ? '4/day' : 
                            med.frequency === 'sos' ? 'SOS' : 
                            med.frequency === 'weekly' ? '1/week' : 
                            med.frequency === 'biweekly' ? '2/week' : 
                            med.frequency === 'monthly' ? '1/month' : 
                            med.frequency === 'hourly' ? '6hrs' : 
                            med.frequency === 'stat' ? 'STAT' : '?'}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">{med.duration}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">{med.instructions}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-center">
                            <button
                              type="button"
                              onClick={() => removeMedicine(med.id)}
                              className="text-red-500 hover:text-red-700"
                              aria-label="Remove medicine"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6">
          <button
            type="button"
            onClick={generatePDF}
            disabled={medicines.length === 0}
            className={`w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-flex items-center justify-center transition duration-300 ${medicines.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <FaFilePdf className="mr-2" />
            Download
          </button>
          
          <button
            type="submit"
            disabled={medicines.length === 0 || isSending || !patientEmail}
            className={`w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded inline-flex items-center justify-center transition duration-300 ${(medicines.length === 0 || isSending || !patientEmail) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {emailSent ? <FaCheck className="mr-2" /> : <FaEnvelope className="mr-2" />}
            {isSending ? 'Sending...' : emailSent ? 'Sent!' : 'Email'}
          </button>
        </div>

        {/* Email Status Message */}
        {emailStatus && (
          <div className={`mt-4 p-3 rounded text-sm ${emailStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {emailStatus.message}
          </div>
        )}
      </form>
    </div>
  );
};

export default PrescriptionGenerator; 