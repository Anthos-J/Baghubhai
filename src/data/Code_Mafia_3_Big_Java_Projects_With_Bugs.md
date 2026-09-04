# Code Mafia — 3 Larger Java Projects with Intentional Bugs

These projects are designed as richer Code Mafia game instances than the small programming-problem examples.

Each project:
- has more than 8–9 meaningful functions/methods
- uses one shared Java codebase
- contains exactly 9 initial bugs
- can be divided among 3 Developers as 3 bugs/tasks each
- is suitable for room-based debugging gameplay
- can later be evaluated semantically by Groq

---

## PROJECT 1 — BANK MANAGEMENT SYSTEM

### Important Functional Requirements
1. Create an account.
2. Prevent duplicate account numbers.
3. Deposit only positive amounts.
4. Withdraw only when sufficient balance exists.
5. Transfer money between valid accounts.
6. Find accounts by account number.
7. Display all accounts.
8. Calculate total balance.
9. Apply interest.
10. Freeze/unfreeze accounts.
11. Record transaction history.
12. Generate a transaction summary.

### Bug Manifest
1. `findAccount()` returns the first account whose number is NOT equal.
2. Deposit accepts a zero amount.
3. Withdrawal rejects withdrawing the entire balance.
4. Transfer accepts zero as a valid transfer amount.
5. Total balance subtracts instead of adding.
6. Interest rate of zero is treated as invalid.
7. Freeze status is inverted.
8. Final total is exposed through a duplicate/corrupted verification path.
9. Verification interprets a negative total as a successful condition.

---

## PROJECT 2 — LIBRARY MANAGEMENT SYSTEM

### Features
- add books
- remove books
- register members
- search by title
- search by author
- issue a book
- return a book
- calculate overdue fines
- display available books
- display member information
- maintain borrowing history
- generate library statistics

### Bug Manifest
1. `findBook()` returns the first book whose ID is NOT equal.
2. `removeBook()` incorrectly allows only issued books to be removed.
3. `issueBook()` refuses available books and accepts already issued books.
4. Fine calculation incorrectly allows negative days to proceed.
5. Available-books query returns issued books.
6. Borrowed count counts available books instead of issued books.
7. Display status text is reversed.
8. Returned fine is incorrectly increased by 5 in the final output.
9. Overload check uses an impossible/wrong condition.

---

## PROJECT 3 — STUDENT COURSE / RESULT MANAGEMENT SYSTEM

### Features
- register students
- add courses
- enroll students
- record marks
- update marks
- calculate average
- calculate grade
- calculate GPA
- find topper
- search students
- generate transcript
- calculate pass percentage
- remove students
- remove courses

### Bug Manifest
1. Student lookup returns the first student whose ID is NOT equal.
2. Mark value `0` is incorrectly rejected.
3. Average subtracts marks instead of adding them.
4. GPA subtracts course credits.
5. Topper search starts from an incorrect baseline.
6. Pass condition excludes exactly 50 marks.
7. Pass percentage output is corrupted by adding 100.
8. GPA health check uses the wrong success interpretation.
9. Final topper verification expects the wrong condition.
