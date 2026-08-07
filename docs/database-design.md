# Database Design

## Collections

### Users

Fields:

- _id
- name
- phone
- email
- trustScore
- isVerified
- emergencyContacts

---

### Journeys

Fields:

- _id
- userId
- source
- destination
- status
- riskLevel
- buddyId
- startedAt
- endedAt

---

### Incidents

Fields:

- _id
- userId
- journeyId
- type
- severity
- location
- description

---

### Buddies

Fields:

- _id
- userA
- userB
- journeyId
- matchScore
- status

---

## Relationships

User
|
|-- Journey
|
|-- Incident

Journey
|
|-- Buddy Match
|
|-- Incident