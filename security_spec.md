# EzeCampus Firestore Security Specification

## 1. Data Invariants
1. **PII Isolation**: `/users/{userId}` holds email and phone numbers and is strictly readable and writable only by `userId == request.auth.uid` or verified administrators.
2. **No Privilege Escalation**: Normal students creating or updating `/users/{userId}` cannot assign or modify `role` to `"admin"`. Only verified admins (`harshitkumar810271@gmail.com` with `email_verified == true` or a record in `/admins/{uid}`) can manage roles or access admin collections.
3. **Public Matching Without PII**: `/roommateProfiles/{profileId}` exposes lifestyle preferences only; `uid` must equal `profileId` and `request.auth.uid` on create/update.
4. **Scoped Roommate Requests & Terminal State Locking**: Only `senderUid` or `receiverUid` (or admin) may read a `/roommateRequests/{requestId}` document. Once a request status reaches `'accepted'`, `'declined'`, or `'withdrawn'`, non-admins cannot mutate it again.
5. **Marketplace Ownership**: Students can create `/marketplaceItems/{itemId}` only with `sellerUid == request.auth.uid` and `status == 'available'`, and may only update or delete items they own (unless admin).
6. **Admin-Managed Catalogs**: `/accommodations`, `/campusOpportunities`, and `/localServices` can only be created, updated, or deleted by verified administrators.
7. **Strict Timestamps & Schema Boundaries**: Every write enforces `request.time` for `createdAt`/`updatedAt`, strict `hasAll`/`hasOnly` key allowlists, ID regex `^[a-zA-Z0-9_\-]+$`, and bounded string/array lengths.

## 2. The "Dirty Dozen" Adversarial Payloads (Must Return PERMISSION_DENIED)
1. **Self-Assigned Admin Role**: `POST /users/u1` with `{ role: "admin", ... }` by normal student `u1`.
2. **Role Escalation Update**: `PATCH /users/u1` modifying `role: "admin"` on existing student document.
3. **Cross-User PII Read**: `GET /users/u2` executed by authenticated student `u1`.
4. **Shadow Field Injection**: `POST /marketplaceItems/m1` adding undocumented key `isVerified: true`.
5. **Seller Spoofing**: `POST /marketplaceItems/m1` with `sellerUid: "otherUser"` while authenticated as `u1`.
6. **Unverified Admin Email Spoof**: Request claiming `email: "harshitkumar810271@gmail.com"` with `email_verified: false`.
7. **ID Poisoning**: Creating `/marketplaceItems/` with a 1500-character or special-character document ID.
8. **Timestamp Forgery**: Creating a listing with client-forged `createdAt` not matching `request.time`.
9. **Terminal State Re-open**: Updating a `'declined'` roommate request back to `'accepted'` as a non-admin.
10. **Non-Admin Catalog Write**: Normal student attempting `POST /accommodations/pg1` or `DELETE /campusOpportunities/opp1`.
11. **Oversized Payload DoW**: Writing a 5,000-character description exceeding `maxLength: 600`.
12. **Blanket Report Scraping**: Normal student attempting `LIST /reports` to read other users' moderation reports.
