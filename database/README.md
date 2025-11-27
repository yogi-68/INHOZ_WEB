# INHOZ Database Setup

This directory contains MongoDB database initialization and seeding scripts.

## Prerequisites

- MongoDB Atlas account (or local MongoDB instance)
- MongoDB Shell (`mongosh`) installed
- Node.js backend configured with database connection

## Files

- `init-db.js` - Creates collections, indexes, and time-series setup
- `seed-data.js` - Populates database with sample test data
- `README.md` - This file

## Setup Instructions

### 1. Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a new cluster (M0 Free Tier works for development)
3. Create a database user with read/write permissions
4. Add your IP address to the IP Access List
5. Get your connection string

### 2. Initialize Database

Run the initialization script to create collections and indexes:

```bash
mongosh "your-mongodb-connection-string" --file init-db.js
```

Or connect to mongosh first:

```bash
mongosh "your-mongodb-connection-string"
```

Then run:

```javascript
load('init-db.js')
```

### 3. Seed Sample Data (Optional)

Populate the database with test data:

```bash
mongosh "your-mongodb-connection-string" --file seed-data.js
```

**Note**: The seed script includes placeholder password hashes. You'll need to modify it to use actual bcrypt hashing in your backend.

## Database Structure

### Collections

1. **users** - User accounts (admin, doctor, patient)
2. **doctors** - Doctor-specific information
3. **patients** - Patient medical records
4. **assignments** - Patient-to-doctor assignments (immutable audit trail)
5. **prescriptions** - Medical prescriptions
6. **invoices** - Billing and invoices
7. **vitals** - Time-series vitals data from sensors
8. **ml_events** - ML model detection events (falls, etc.)
9. **alerts** - System-generated alerts
10. **audit_logs** - Immutable audit trail

### Time-Series Collection

The `vitals` collection is configured as a MongoDB time-series collection for optimal storage and querying of sensor data.

**Configuration:**
- `timeField`: `timestamp`
- `metaField`: `meta`
- `granularity`: `seconds`
- `expireAfterSeconds`: 31536000 (1 year)

## Sample Test Credentials

After seeding, use these credentials for testing:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@inhoz.com | admin123 |
| Doctor 1 | dr.smith@inhoz.com | doctor123 |
| Doctor 2 | dr.johnson@inhoz.com | doctor123 |
| Patient 1 | patient1@example.com | patient123 |
| Patient 2 | patient2@example.com | patient123 |

**⚠️ WARNING**: Change these passwords immediately in production!

## Sample Data Overview

After running `seed-data.js`, you'll have:

- **1 Admin** - System administrator
- **2 Doctors** - One cardiologist, one emergency medicine doctor
- **2 Patients** - Assigned to different doctors
- **48 Vitals Records** - 24 hours of data for each patient
- **2 Alerts** - One pending, one acknowledged
- **2 Prescriptions** - Active prescriptions for both patients
- **2 Invoices** - One pending, one paid
- **1 ML Event** - Sample fall detection event
- **2 Audit Log Entries** - Sample audit trail records

## Indexes

All necessary indexes are created by `init-db.js`:

### Performance Indexes
- `users`: email (unique), role, isActive
- `patients`: userId (unique), assignedDoctorId, hospitalId, status
- `doctors`: userId (unique), specialty
- `vitals`: meta.patientId + timestamp, meta.deviceId
- `alerts`: patientId + createdAt, doctorId + acknowledgedAt, severity
- `prescriptions`: patientId + createdAt, doctorId + createdAt

### Audit Indexes
- `audit_logs`: actorUserId + createdAt, resource + resourceId, createdAt

## Backup & Restore

### Create Backup

```bash
mongodump --uri="your-mongodb-connection-string" --out=./backup
```

### Restore Backup

```bash
mongorestore --uri="your-mongodb-connection-string" ./backup
```

## Data Retention

- **Vitals**: Automatically expire after 1 year (configurable)
- **All Other Collections**: No automatic expiration (soft-delete only)
- **Audit Logs**: Never deleted (regulatory compliance)

## Production Considerations

1. **Enable Encryption**: Use MongoDB Atlas encryption at rest
2. **Configure Backups**: Set up continuous backups with point-in-time recovery
3. **Set Up Monitoring**: Configure Atlas monitoring and alerts
4. **Rotate Credentials**: Implement credential rotation policy
5. **Review Indexes**: Monitor and optimize based on query patterns
6. **Scale Appropriately**: Upgrade cluster tier based on load

## Troubleshooting

### Connection Issues

If you can't connect to MongoDB Atlas:
1. Check your IP address is whitelisted
2. Verify database user credentials
3. Ensure connection string is correct
4. Check network/firewall settings

### Seed Script Fails

If `seed-data.js` fails:
1. Make sure `init-db.js` ran successfully first
2. Check for duplicate data (run on fresh database)
3. Verify MongoDB version compatibility (4.4+)

### Time-Series Collection Issues

If vitals collection doesn't work:
1. Ensure MongoDB 5.0+ is being used
2. Check time-series collection creation syntax
3. Verify `timeField` and `metaField` are correct

## Next Steps

After database setup:

1. Configure backend environment variables with connection string
2. Implement authentication endpoints using sample data
3. Test API endpoints with provided credentials
4. Set up Socket.IO for real-time updates
5. Implement rules engine for alert generation

## Support

For issues or questions:
- Check MongoDB Atlas documentation
- Review INHOZ system specification (SYSTEM_SPEC.md)
- Contact development team

---

**Last Updated**: November 27, 2025
