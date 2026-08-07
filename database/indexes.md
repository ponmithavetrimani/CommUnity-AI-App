# CommUnity AI Database Indexes

## User Collection

Indexes:

* phone (unique)
* trustScore

Purpose:

* Fast login lookup
* Fast trust score filtering

---

## Journey Collection

Indexes:

* userId
* status
* createdAt

Purpose:

* Active journey lookup
* Journey history

---

## Incident Collection

Indexes:

* userId
* journeyId
* severity

Purpose:

* Risk analysis
* Incident reporting

---

## Buddy Collection

Indexes:

* userA
* userB
* journeyId
* matchScore

Purpose:

* Buddy matching
* Recommendation engine

---

## Future Optimizations

Geo Index:

location.coordinates

Used for:

* Nearby buddy search
* Emergency assistance routing
* Live tracking
