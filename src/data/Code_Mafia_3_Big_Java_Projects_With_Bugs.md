# Code Mafia — 3 Larger Java Projects with Intentional Bugs

These projects are designed as richer Code Mafia game instances than the
small programming-problem examples.

Each project:
- has more than 8–9 meaningful functions/methods
- uses one shared Java codebase
- contains exactly 9 initial bugs
- can be divided among 3 Developers as 3 bugs/tasks each
- is suitable for room-based debugging gameplay
- can later be evaluated semantically by Groq

IMPORTANT GAME RULE:
The correct version is the hidden canonical solution.
The buggy version is what players receive.
The bug manifest must remain hidden from players.

Suggested structure for 3 Developers:

Developer 1 → Bugs 1–3
Developer 2 → Bugs 4–6
Developer 3 → Bugs 7–9

All developers work on the SAME Java source file.

============================================================
PROJECT 1 — BANK MANAGEMENT SYSTEM
============================================================

### Project Description

Build a console-based Bank Management System in Java.

The program supports:
- creating bank accounts
- depositing money
- withdrawing money
- transferring money
- finding accounts
- checking balances
- displaying account information
- calculating total bank balance
- applying interest
- changing account status
- generating transaction summaries
- processing a small set of transactions

This is intentionally larger than a basic lab problem and contains many
independent functions that can become separate debugging responsibilities.

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

### Canonical Correct Java Code

```java
import java.util.*;

public class BankManagementSystem {

    static class Account {
        int accountNumber;
        String holderName;
        double balance;
        boolean frozen;
        List<String> transactions = new ArrayList<>();

        Account(int accountNumber, String holderName, double balance) {
            this.accountNumber = accountNumber;
            this.holderName = holderName;
            this.balance = balance;
            this.frozen = false;
            transactions.add("ACCOUNT CREATED: " + balance);
        }
    }

    static List<Account> accounts = new ArrayList<>();

    static Account findAccount(int accountNumber) {
        for (Account account : accounts) {
            if (account.accountNumber == accountNumber) {
                return account;
            }
        }
        return null;
    }

    static boolean createAccount(int accountNumber, String holderName, double openingBalance) {
        if (findAccount(accountNumber) != null || openingBalance < 0) {
            return false;
        }

        Account account = new Account(accountNumber, holderName, openingBalance);
        accounts.add(account);
        return true;
    }

    static boolean deposit(int accountNumber, double amount) {
        Account account = findAccount(accountNumber);

        if (account == null || account.frozen || amount <= 0) {
            return false;
        }

        account.balance += amount;
        account.transactions.add("DEPOSIT: " + amount);
        return true;
    }

    static boolean withdraw(int accountNumber, double amount) {
        Account account = findAccount(accountNumber);

        if (account == null || account.frozen || amount <= 0 ||
                amount > account.balance) {
            return false;
        }

        account.balance -= amount;
        account.transactions.add("WITHDRAW: " + amount);
        return true;
    }

    static boolean transfer(int fromAccount, int toAccount, double amount) {
        Account sender = findAccount(fromAccount);
        Account receiver = findAccount(toAccount);

        if (sender == null || receiver == null || sender.frozen || receiver.frozen ||
                amount <= 0 || amount > sender.balance) {
            return false;
        }

        sender.balance -= amount;
        receiver.balance += amount;

        sender.transactions.add("TRANSFER OUT: " + amount + " TO " + toAccount);
        receiver.transactions.add("TRANSFER IN: " + amount + " FROM " + fromAccount);

        return true;
    }

    static void displayAccount(int accountNumber) {
        Account account = findAccount(accountNumber);

        if (account == null) {
            System.out.println("Account not found.");
            return;
        }

        System.out.println("Account: " + account.accountNumber);
        System.out.println("Holder: " + account.holderName);
        System.out.println("Balance: " + account.balance);
        System.out.println("Status: " + (account.frozen ? "FROZEN" : "ACTIVE"));
    }

    static void displayAllAccounts() {
        for (Account account : accounts) {
            displayAccount(account.accountNumber);
            System.out.println("----------------");
        }
    }

    static double calculateTotalBalance() {
        double total = 0;

        for (Account account : accounts) {
            total += account.balance;
        }

        return total;
    }

    static void applyInterest(double annualRate) {
        if (annualRate < 0) {
            return;
        }

        for (Account account : accounts) {
            if (!account.frozen) {
                double interest = account.balance * annualRate / 100.0;
                account.balance += interest;
                account.transactions.add("INTEREST: " + interest);
            }
        }
    }

    static boolean setFreezeStatus(int accountNumber, boolean frozen) {
        Account account = findAccount(accountNumber);

        if (account == null) {
            return false;
        }

        account.frozen = frozen;
        account.transactions.add(frozen ? "ACCOUNT FROZEN" : "ACCOUNT UNFROZEN");
        return true;
    }

    static List<String> getTransactionHistory(int accountNumber) {
        Account account = findAccount(accountNumber);

        if (account == null) {
            return Collections.emptyList();
        }

        return new ArrayList<>(account.transactions);
    }

    static String generateSummary() {
        StringBuilder summary = new StringBuilder();
        summary.append("TOTAL ACCOUNTS: ").append(accounts.size()).append("\n");
        summary.append("TOTAL BALANCE: ").append(calculateTotalBalance()).append("\n");

        for (Account account : accounts) {
            summary.append(account.accountNumber)
                   .append(" | ")
                   .append(account.holderName)
                   .append(" | ")
                   .append(account.balance)
                   .append("\n");
        }

        return summary.toString();
    }

    static void seedDemoData() {
        createAccount(1001, "Aarav", 10000);
        createAccount(1002, "Diya", 15000);
        createAccount(1003, "Kabir", 7000);

        deposit(1001, 2000);
        withdraw(1002, 3000);
        transfer(1001, 1003, 1500);
    }

    public static void main(String[] args) {
        seedDemoData();

        System.out.println(generateSummary());

        applyInterest(5);

        displayAllAccounts();

        System.out.println("Transactions for 1001:");
        for (String transaction : getTransactionHistory(1001)) {
            System.out.println(transaction);
        }
    }
}
```

### Intentionally Buggy Java Code — EXACTLY 9 BUGS

```java
import java.util.*;

public class BankManagementSystem {

    static class Account {
        int accountNumber;
        String holderName;
        double balance;
        boolean frozen;
        List<String> transactions = new ArrayList<>();

        Account(int accountNumber, String holderName, double balance) {
            this.accountNumber = accountNumber;
            this.holderName = holderName;
            this.balance = balance;
            this.frozen = false;
            transactions.add("ACCOUNT CREATED: " + balance);
        }
    }

    static List<Account> accounts = new ArrayList<>();

    static Account findAccount(int accountNumber) {
        for (Account account : accounts) {
            if (account.accountNumber != accountNumber) {      // BUG 1
                return account;
            }
        }
        return null;
    }

    static boolean createAccount(int accountNumber, String holderName, double openingBalance) {
        if (findAccount(accountNumber) != null || openingBalance < 0) {
            return false;
        }

        Account account = new Account(accountNumber, holderName, openingBalance);
        accounts.add(account);
        return true;
    }

    static boolean deposit(int accountNumber, double amount) {
        Account account = findAccount(accountNumber);

        if (account == null || account.frozen || amount < 0) { // BUG 2
            return false;
        }

        account.balance += amount;
        account.transactions.add("DEPOSIT: " + amount);
        return true;
    }

    static boolean withdraw(int accountNumber, double amount) {
        Account account = findAccount(accountNumber);

        if (account == null || account.frozen || amount <= 0 ||
                amount >= account.balance) {                 // BUG 3
            return false;
        }

        account.balance -= amount;
        account.transactions.add("WITHDRAW: " + amount);
        return true;
    }

    static boolean transfer(int fromAccount, int toAccount, double amount) {
        Account sender = findAccount(fromAccount);
        Account receiver = findAccount(toAccount);

        if (sender == null || receiver == null || sender.frozen ||
                receiver.frozen || amount < 0 ||                 // BUG 4
                amount > sender.balance) {
            return false;
        }

        sender.balance -= amount;
        receiver.balance += amount;

        sender.transactions.add("TRANSFER OUT: " + amount + " TO " + toAccount);
        receiver.transactions.add("TRANSFER IN: " + amount + " FROM " + fromAccount);

        return true;
    }

    static void displayAccount(int accountNumber) {
        Account account = findAccount(accountNumber);

        if (account == null) {
            System.out.println("Account not found.");
            return;
        }

        System.out.println("Account: " + account.accountNumber);
        System.out.println("Holder: " + account.holderName);
        System.out.println("Balance: " + account.balance);
        System.out.println("Status: " + (account.frozen ? "FROZEN" : "ACTIVE"));
    }

    static void displayAllAccounts() {
        for (Account account : accounts) {
            displayAccount(account.accountNumber);
            System.out.println("----------------");
        }
    }

    static double calculateTotalBalance() {
        double total = 0;

        for (Account account : accounts) {
            total -= account.balance;                         // BUG 5
        }

        return total;
    }

    static void applyInterest(double annualRate) {
        if (annualRate <= 0) {                                // BUG 6
            return;
        }

        for (Account account : accounts) {
            if (!account.frozen) {
                double interest = account.balance * annualRate / 100.0;
                account.balance += interest;
                account.transactions.add("INTEREST: " + interest);
            }
        }
    }

    static boolean setFreezeStatus(int accountNumber, boolean frozen) {
        Account account = findAccount(accountNumber);

        if (account == null) {
            return false;
        }

        account.frozen = !frozen;                             // BUG 7
        account.transactions.add(frozen ? "ACCOUNT FROZEN" : "ACCOUNT UNFROZEN");
        return true;
    }

    static List<String> getTransactionHistory(int accountNumber) {
        Account account = findAccount(accountNumber);

        if (account == null) {
            return Collections.emptyList();
        }

        return new ArrayList<>(account.transactions);
    }

    static String generateSummary() {
        StringBuilder summary = new StringBuilder();
        summary.append("TOTAL ACCOUNTS: ").append(accounts.size()).append("\n");
        summary.append("TOTAL BALANCE: ").append(calculateTotalBalance()).append("\n");

        for (Account account : accounts) {
            summary.append(account.accountNumber)
                   .append(" | ")
                   .append(account.holderName)
                   .append(" | ")
                   .append(account.balance)
                   .append("\n");
        }

        return summary.toString();
    }

    static void seedDemoData() {
        createAccount(1001, "Aarav", 10000);
        createAccount(1002, "Diya", 15000);
        createAccount(1003, "Kabir", 7000);

        deposit(1001, 2000);
        withdraw(1002, 3000);
        transfer(1001, 1003, 1500);
    }

    public static void main(String[] args) {
        seedDemoData();

        System.out.println(generateSummary());

        applyInterest(5);

        displayAllAccounts();

        System.out.println("Transactions for 1001:");
        for (String transaction : getTransactionHistory(1001)) {
            System.out.println(transaction);
        }

        System.out.println("Bank total after interest: "
                + calculateTotalBalance());                     // BUG 8

        System.out.println("Developer verification: " +
                (calculateTotalBalance() < 0));                 // BUG 9
    }
}
```

### Bug Manifest

1. `findAccount()` returns the first account whose number is NOT equal.
2. Deposit accepts a zero amount.
3. Withdrawal rejects withdrawing the entire balance.
4. Transfer accepts zero as a valid transfer amount.
5. Total balance subtracts instead of adding.
6. Interest rate of zero is treated as invalid (edge-condition corruption).
7. Freeze status is inverted.
8. Final total is exposed through a duplicate/corrupted verification path.
9. Verification interprets a negative total as a successful condition.

Suggested task grouping:
- Developer 1: Bugs 1–3 — account lookup, deposits, withdrawals.
- Developer 2: Bugs 4–6 — transfers, totals, interest.
- Developer 3: Bugs 7–9 — account status, final verification and summary.

============================================================
PROJECT 2 — LIBRARY MANAGEMENT SYSTEM
============================================================

### Project Description

Build a console-based Library Management System.

Features:
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

### Canonical Correct Java Code

```java
import java.util.*;

public class LibraryManagementSystem {

    static class Book {
        int id;
        String title;
        String author;
        boolean issued;
        int issuedToMember;

        Book(int id, String title, String author) {
            this.id = id;
            this.title = title;
            this.author = author;
            this.issued = false;
            this.issuedToMember = -1;
        }
    }

    static class Member {
        int id;
        String name;
        List<Integer> borrowedBooks = new ArrayList<>();
        List<String> history = new ArrayList<>();

        Member(int id, String name) {
            this.id = id;
            this.name = name;
        }
    }

    static List<Book> books = new ArrayList<>();
    static List<Member> members = new ArrayList<>();

    static Book findBook(int id) {
        for (Book book : books) {
            if (book.id == id) {
                return book;
            }
        }
        return null;
    }

    static Member findMember(int id) {
        for (Member member : members) {
            if (member.id == id) {
                return member;
            }
        }
        return null;
    }

    static boolean addBook(int id, String title, String author) {
        if (findBook(id) != null) {
            return false;
        }

        books.add(new Book(id, title, author));
        return true;
    }

    static boolean removeBook(int id) {
        Book book = findBook(id);

        if (book == null || book.issued) {
            return false;
        }

        return books.remove(book);
    }

    static boolean registerMember(int id, String name) {
        if (findMember(id) != null) {
            return false;
        }

        members.add(new Member(id, name));
        return true;
    }

    static List<Book> searchByTitle(String query) {
        List<Book> results = new ArrayList<>();

        for (Book book : books) {
            if (book.title.toLowerCase().contains(query.toLowerCase())) {
                results.add(book);
            }
        }

        return results;
    }

    static List<Book> searchByAuthor(String query) {
        List<Book> results = new ArrayList<>();

        for (Book book : books) {
            if (book.author.toLowerCase().contains(query.toLowerCase())) {
                results.add(book);
            }
        }

        return results;
    }

    static boolean issueBook(int bookId, int memberId) {
        Book book = findBook(bookId);
        Member member = findMember(memberId);

        if (book == null || member == null || book.issued) {
            return false;
        }

        book.issued = true;
        book.issuedToMember = memberId;
        member.borrowedBooks.add(bookId);
        member.history.add("ISSUED: " + bookId);

        return true;
    }

    static double returnBook(int bookId, int memberId, int overdueDays) {
        Book book = findBook(bookId);
        Member member = findMember(memberId);

        if (book == null || member == null ||
                !book.issued || book.issuedToMember != memberId) {
            return -1;
        }

        book.issued = false;
        book.issuedToMember = -1;

        member.borrowedBooks.remove(Integer.valueOf(bookId));
        member.history.add("RETURNED: " + bookId);

        return calculateFine(overdueDays);
    }

    static double calculateFine(int overdueDays) {
        if (overdueDays <= 0) {
            return 0;
        }

        return overdueDays * 5.0;
    }

    static List<Book> getAvailableBooks() {
        List<Book> available = new ArrayList<>();

        for (Book book : books) {
            if (!book.issued) {
                available.add(book);
            }
        }

        return available;
    }

    static List<String> getMemberHistory(int memberId) {
        Member member = findMember(memberId);

        if (member == null) {
            return Collections.emptyList();
        }

        return new ArrayList<>(member.history);
    }

    static int getBorrowedBookCount() {
        int count = 0;

        for (Book book : books) {
            if (book.issued) {
                count++;
            }
        }

        return count;
    }

    static String generateStatistics() {
        int totalBooks = books.size();
        int totalMembers = members.size();
        int issuedBooks = getBorrowedBookCount();
        int availableBooks = totalBooks - issuedBooks;

        return "BOOKS: " + totalBooks +
                "\nMEMBERS: " + totalMembers +
                "\nISSUED: " + issuedBooks +
                "\nAVAILABLE: " + availableBooks;
    }

    static void displayBook(int bookId) {
        Book book = findBook(bookId);

        if (book == null) {
            System.out.println("Book not found.");
            return;
        }

        System.out.println(book.id + " | " + book.title + " | " +
                book.author + " | " +
                (book.issued ? "ISSUED" : "AVAILABLE"));
    }

    static void seedDemoData() {
        addBook(1, "Clean Code", "Robert Martin");
        addBook(2, "Effective Java", "Joshua Bloch");
        addBook(3, "Design Patterns", "Gang of Four");

        registerMember(101, "Soham");
        registerMember(102, "Riya");

        issueBook(1, 101);
    }

    public static void main(String[] args) {
        seedDemoData();

        System.out.println(generateStatistics());

        System.out.println("Search results:");
        for (Book book : searchByTitle("java")) {
            displayBook(book.id);
        }

        double fine = returnBook(1, 101, 3);
        System.out.println("Fine: " + fine);

        System.out.println(generateStatistics());
    }
}
```

### Intentionally Buggy Java Code — EXACTLY 9 BUGS

```java
import java.util.*;

public class LibraryManagementSystem {

    static class Book {
        int id;
        String title;
        String author;
        boolean issued;
        int issuedToMember;

        Book(int id, String title, String author) {
            this.id = id;
            this.title = title;
            this.author = author;
            this.issued = false;
            this.issuedToMember = -1;
        }
    }

    static class Member {
        int id;
        String name;
        List<Integer> borrowedBooks = new ArrayList<>();
        List<String> history = new ArrayList<>();

        Member(int id, String name) {
            this.id = id;
            this.name = name;
        }
    }

    static List<Book> books = new ArrayList<>();
    static List<Member> members = new ArrayList<>();

    static Book findBook(int id) {
        for (Book book : books) {
            if (book.id != id) {                         // BUG 1
                return book;
            }
        }
        return null;
    }

    static Member findMember(int id) {
        for (Member member : members) {
            if (member.id == id) {
                return member;
            }
        }
        return null;
    }

    static boolean addBook(int id, String title, String author) {
        if (findBook(id) != null) {
            return false;
        }

        books.add(new Book(id, title, author));
        return true;
    }

    static boolean removeBook(int id) {
        Book book = findBook(id);

        if (book == null || !book.issued) {             // BUG 2
            return false;
        }

        return books.remove(book);
    }

    static boolean registerMember(int id, String name) {
        if (findMember(id) != null) {
            return false;
        }

        members.add(new Member(id, name));
        return true;
    }

    static List<Book> searchByTitle(String query) {
        List<Book> results = new ArrayList<>();

        for (Book book : books) {
            if (book.title.toLowerCase().contains(query.toLowerCase())) {
                results.add(book);
            }
        }

        return results;
    }

    static List<Book> searchByAuthor(String query) {
        List<Book> results = new ArrayList<>();

        for (Book book : books) {
            if (book.author.toLowerCase().contains(query.toLowerCase())) {
                results.add(book);
            }
        }

        return results;
    }

    static boolean issueBook(int bookId, int memberId) {
        Book book = findBook(bookId);
        Member member = findMember(memberId);

        if (book == null || member == null || !book.issued) { // BUG 3
            return false;
        }

        book.issued = true;
        book.issuedToMember = memberId;
        member.borrowedBooks.add(bookId);
        member.history.add("ISSUED: " + bookId);

        return true;
    }

    static double returnBook(int bookId, int memberId, int overdueDays) {
        Book book = findBook(bookId);
        Member member = findMember(memberId);

        if (book == null || member == null ||
                !book.issued || book.issuedToMember != memberId) {
            return -1;
        }

        book.issued = false;
        book.issuedToMember = -1;

        member.borrowedBooks.remove(Integer.valueOf(bookId));
        member.history.add("RETURNED: " + bookId);

        return calculateFine(overdueDays);
    }

    static double calculateFine(int overdueDays) {
        if (overdueDays < 0) {                            // BUG 4
            return 0;
        }

        return overdueDays * 5.0;
    }

    static List<Book> getAvailableBooks() {
        List<Book> available = new ArrayList<>();

        for (Book book : books) {
            if (book.issued) {                            // BUG 5
                available.add(book);
            }
        }

        return available;
    }

    static List<String> getMemberHistory(int memberId) {
        Member member = findMember(memberId);

        if (member == null) {
            return Collections.emptyList();
        }

        return new ArrayList<>(member.history);
    }

    static int getBorrowedBookCount() {
        int count = 0;

        for (Book book : books) {
            if (!book.issued) {                           // BUG 6
                count++;
            }
        }

        return count;
    }

    static String generateStatistics() {
        int totalBooks = books.size();
        int totalMembers = members.size();
        int issuedBooks = getBorrowedBookCount();
        int availableBooks = totalBooks - issuedBooks;

        return "BOOKS: " + totalBooks +
                "\nMEMBERS: " + totalMembers +
                "\nISSUED: " + issuedBooks +
                "\nAVAILABLE: " + availableBooks;
    }

    static void displayBook(int bookId) {
        Book book = findBook(bookId);

        if (book == null) {
            System.out.println("Book not found.");
            return;
        }

        System.out.println(book.id + " | " + book.title + " | " +
                book.author + " | " +
                (book.issued ? "AVAILABLE" : "ISSUED"));  // BUG 7
    }

    static void seedDemoData() {
        addBook(1, "Clean Code", "Robert Martin");
        addBook(2, "Effective Java", "Joshua Bloch");
        addBook(3, "Design Patterns", "Gang of Four");

        registerMember(101, "Soham");
        registerMember(102, "Riya");

        issueBook(1, 101);
    }

    public static void main(String[] args) {
        seedDemoData();

        System.out.println(generateStatistics());

        System.out.println("Search results:");
        for (Book book : searchByTitle("java")) {
            displayBook(book.id);
        }

        double fine = returnBook(1, 101, 3);
        System.out.println("Fine: " + (fine + 5));       // BUG 8

        System.out.println(generateStatistics());

        if (getBorrowedBookCount() > books.size()) {     // BUG 9
            System.out.println("Library overload detected");
        }
    }
}
```

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

Suggested task grouping:
- Developer 1: Bugs 1–3 — lookup/removal/issue logic.
- Developer 2: Bugs 4–6 — fines/availability/statistics.
- Developer 3: Bugs 7–9 — output/reporting/final validation.

============================================================
PROJECT 3 — STUDENT COURSE / RESULT MANAGEMENT SYSTEM
============================================================

### Project Description

Build a console-based Student Course and Result Management System.

Features:
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

This project is intentionally structured as a multi-function application so
different rooms can represent different responsibilities.

### Canonical Correct Java Code

```java
import java.util.*;

public class StudentResultSystem {

    static class Student {
        int id;
        String name;
        Map<String, Double> marks = new HashMap<>();

        Student(int id, String name) {
            this.id = id;
            this.name = name;
        }
    }

    static class Course {
        String code;
        String name;
        int credits;

        Course(String code, String name, int credits) {
            this.code = code;
            this.name = name;
            this.credits = credits;
        }
    }

    static List<Student> students = new ArrayList<>();
    static List<Course> courses = new ArrayList<>();

    static Student findStudent(int id) {
        for (Student student : students) {
            if (student.id == id) {
                return student;
            }
        }
        return null;
    }

    static Course findCourse(String code) {
        for (Course course : courses) {
            if (course.code.equalsIgnoreCase(code)) {
                return course;
            }
        }
        return null;
    }

    static boolean addStudent(int id, String name) {
        if (findStudent(id) != null) {
            return false;
        }

        students.add(new Student(id, name));
        return true;
    }

    static boolean removeStudent(int id) {
        Student student = findStudent(id);

        if (student == null) {
            return false;
        }

        return students.remove(student);
    }

    static boolean addCourse(String code, String name, int credits) {
        if (findCourse(code) != null || credits <= 0) {
            return false;
        }

        courses.add(new Course(code, name, credits));
        return true;
    }

    static boolean removeCourse(String code) {
        Course course = findCourse(code);

        if (course == null) {
            return false;
        }

        for (Student student : students) {
            student.marks.remove(course.code);
        }

        return courses.remove(course);
    }

    static boolean enrollStudent(int studentId, String courseCode) {
        Student student = findStudent(studentId);
        Course course = findCourse(courseCode);

        if (student == null || course == null) {
            return false;
        }

        student.marks.putIfAbsent(course.code, -1.0);
        return true;
    }

    static boolean recordMarks(int studentId, String courseCode, double marks) {
        Student student = findStudent(studentId);
        Course course = findCourse(courseCode);

        if (student == null || course == null ||
                !student.marks.containsKey(courseCode) ||
                marks < 0 || marks > 100) {
            return false;
        }

        student.marks.put(courseCode, marks);
        return true;
    }

    static double calculateAverage(int studentId) {
        Student student = findStudent(studentId);

        if (student == null || student.marks.isEmpty()) {
            return 0;
        }

        double total = 0;
        int count = 0;

        for (double mark : student.marks.values()) {
            if (mark >= 0) {
                total += mark;
                count++;
            }
        }

        return count == 0 ? 0 : total / count;
    }

    static String calculateGrade(double marks) {
        if (marks >= 90) return "A";
        if (marks >= 80) return "B";
        if (marks >= 70) return "C";
        if (marks >= 60) return "D";
        if (marks >= 50) return "E";
        return "F";
    }

    static double gradePoint(double marks) {
        if (marks >= 90) return 10;
        if (marks >= 80) return 9;
        if (marks >= 70) return 8;
        if (marks >= 60) return 7;
        if (marks >= 50) return 6;
        return 0;
    }

    static double calculateGPA(int studentId) {
        Student student = findStudent(studentId);

        if (student == null || student.marks.isEmpty()) {
            return 0;
        }

        double weightedPoints = 0;
        int totalCredits = 0;

        for (Course course : courses) {
            if (student.marks.containsKey(course.code)) {
                double marks = student.marks.get(course.code);

                if (marks >= 0) {
                    weightedPoints += gradePoint(marks) * course.credits;
                    totalCredits += course.credits;
                }
            }
        }

        return totalCredits == 0 ? 0 : weightedPoints / totalCredits;
    }

    static Student findTopper() {
        Student topper = null;
        double bestAverage = -1;

        for (Student student : students) {
            double average = calculateAverage(student.id);

            if (average > bestAverage) {
                bestAverage = average;
                topper = student;
            }
        }

        return topper;
    }

    static List<Student> searchStudents(String query) {
        List<Student> result = new ArrayList<>();

        String normalized = query.toLowerCase();

        for (Student student : students) {
            if (student.name.toLowerCase().contains(normalized) ||
                    String.valueOf(student.id).contains(normalized)) {
                result.add(student);
            }
        }

        return result;
    }

    static String generateTranscript(int studentId) {
        Student student = findStudent(studentId);

        if (student == null) {
            return "Student not found.";
        }

        StringBuilder result = new StringBuilder();

        result.append("STUDENT: ")
              .append(student.name)
              .append(" (")
              .append(student.id)
              .append(")\n");

        for (Course course : courses) {
            if (student.marks.containsKey(course.code)) {
                double marks = student.marks.get(course.code);

                result.append(course.code)
                      .append(" | ")
                      .append(course.name)
                      .append(" | MARKS: ")
                      .append(marks)
                      .append(" | GRADE: ")
                      .append(marks >= 0 ? calculateGrade(marks) : "PENDING")
                      .append("\n");
            }
        }

        result.append("AVERAGE: ")
              .append(calculateAverage(studentId))
              .append("\n");

        result.append("GPA: ")
              .append(calculateGPA(studentId))
              .append("\n");

        return result.toString();
    }

    static double calculatePassPercentage(String courseCode) {
        int total = 0;
        int passed = 0;

        for (Student student : students) {
            if (student.marks.containsKey(courseCode)) {
                double marks = student.marks.get(courseCode);

                if (marks >= 0) {
                    total++;

                    if (marks >= 50) {
                        passed++;
                    }
                }
            }
        }

        return total == 0 ? 0 : (passed * 100.0) / total;
    }

    static void seedDemoData() {
        addStudent(1, "Aarav");
        addStudent(2, "Riya");
        addStudent(3, "Kabir");

        addCourse("CS101", "Programming", 4);
        addCourse("CS102", "Data Structures", 4);
        addCourse("CS103", "Database Systems", 3);

        enrollStudent(1, "CS101");
        enrollStudent(1, "CS102");
        enrollStudent(1, "CS103");

        enrollStudent(2, "CS101");
        enrollStudent(2, "CS102");

        enrollStudent(3, "CS101");
        enrollStudent(3, "CS102");

        recordMarks(1, "CS101", 95);
        recordMarks(1, "CS102", 88);
        recordMarks(1, "CS103", 92);

        recordMarks(2, "CS101", 72);
        recordMarks(2, "CS102", 81);

        recordMarks(3, "CS101", 64);
        recordMarks(3, "CS102", 78);
    }

    public static void main(String[] args) {
        seedDemoData();

        Student topper = findTopper();

        if (topper != null) {
            System.out.println("TOPPER: " + topper.name);
            System.out.println("AVERAGE: " +
                    calculateAverage(topper.id));
        }

        System.out.println();
        System.out.println(generateTranscript(1));

        System.out.println("CS101 PASS %: " +
                calculatePassPercentage("CS101"));

        System.out.println("Search for 'riya':");
        for (Student student : searchStudents("riya")) {
            System.out.println(student.id + " - " + student.name);
        }
    }
}
```

### Intentionally Buggy Java Code — EXACTLY 9 BUGS

```java
import java.util.*;

public class StudentResultSystem {

    static class Student {
        int id;
        String name;
        Map<String, Double> marks = new HashMap<>();

        Student(int id, String name) {
            this.id = id;
            this.name = name;
        }
    }

    static class Course {
        String code;
        String name;
        int credits;

        Course(String code, String name, int credits) {
            this.code = code;
            this.name = name;
            this.credits = credits;
        }
    }

    static List<Student> students = new ArrayList<>();
    static List<Course> courses = new ArrayList<>();

    static Student findStudent(int id) {
        for (Student student : students) {
            if (student.id != id) {                         // BUG 1
                return student;
            }
        }
        return null;
    }

    static Course findCourse(String code) {
        for (Course course : courses) {
            if (course.code.equalsIgnoreCase(code)) {
                return course;
            }
        }
        return null;
    }

    static boolean addStudent(int id, String name) {
        if (findStudent(id) != null) {
            return false;
        }

        students.add(new Student(id, name));
        return true;
    }

    static boolean removeStudent(int id) {
        Student student = findStudent(id);

        if (student == null) {
            return false;
        }

        return students.remove(student);
    }

    static boolean addCourse(String code, String name, int credits) {
        if (findCourse(code) != null || credits <= 0) {
            return false;
        }

        courses.add(new Course(code, name, credits));
        return true;
    }

    static boolean removeCourse(String code) {
        Course course = findCourse(code);

        if (course == null) {
            return false;
        }

        for (Student student : students) {
            student.marks.remove(course.code);
        }

        return courses.remove(course);
    }

    static boolean enrollStudent(int studentId, String courseCode) {
        Student student = findStudent(studentId);
        Course course = findCourse(courseCode);

        if (student == null || course == null) {
            return false;
        }

        student.marks.putIfAbsent(course.code, -1.0);
        return true;
    }

    static boolean recordMarks(int studentId, String courseCode, double marks) {
        Student student = findStudent(studentId);
        Course course = findCourse(courseCode);

        if (student == null || course == null ||
                !student.marks.containsKey(courseCode) ||
                marks <= 0 || marks > 100) {                 // BUG 2
            return false;
        }

        student.marks.put(courseCode, marks);
        return true;
    }

    static double calculateAverage(int studentId) {
        Student student = findStudent(studentId);

        if (student == null || student.marks.isEmpty()) {
            return 0;
        }

        double total = 0;
        int count = 0;

        for (double mark : student.marks.values()) {
            if (mark >= 0) {
                total -= mark;                              // BUG 3
                count++;
            }
        }

        return count == 0 ? 0 : total / count;
    }

    static String calculateGrade(double marks) {
        if (marks >= 90) return "A";
        if (marks >= 80) return "B";
        if (marks >= 70) return "C";
        if (marks >= 60) return "D";
        if (marks >= 50) return "E";
        return "F";
    }

    static double gradePoint(double marks) {
        if (marks >= 90) return 10;
        if (marks >= 80) return 9;
        if (marks >= 70) return 8;
        if (marks >= 60) return 7;
        if (marks >= 50) return 6;
        return 0;
    }

    static double calculateGPA(int studentId) {
        Student student = findStudent(studentId);

        if (student == null || student.marks.isEmpty()) {
            return 0;
        }

        double weightedPoints = 0;
        int totalCredits = 0;

        for (Course course : courses) {
            if (student.marks.containsKey(course.code)) {
                double marks = student.marks.get(course.code);

                if (marks >= 0) {
                    weightedPoints += gradePoint(marks) * course.credits;
                    totalCredits -= course.credits;           // BUG 4
                }
            }
        }

        return totalCredits == 0 ? 0 : weightedPoints / totalCredits;
    }

    static Student findTopper() {
        Student topper = null;
        double bestAverage = 0;                              // BUG 5

        for (Student student : students) {
            double average = calculateAverage(student.id);

            if (average > bestAverage) {
                bestAverage = average;
                topper = student;
            }
        }

        return topper;
    }

    static List<Student> searchStudents(String query) {
        List<Student> result = new ArrayList<>();

        String normalized = query.toLowerCase();

        for (Student student : students) {
            if (student.name.toLowerCase().contains(normalized) ||
                    String.valueOf(student.id).contains(normalized)) {
                result.add(student);
            }
        }

        return result;
    }

    static String generateTranscript(int studentId) {
        Student student = findStudent(studentId);

        if (student == null) {
            return "Student not found.";
        }

        StringBuilder result = new StringBuilder();

        result.append("STUDENT: ")
              .append(student.name)
              .append(" (")
              .append(student.id)
              .append(")\n");

        for (Course course : courses) {
            if (student.marks.containsKey(course.code)) {
                double marks = student.marks.get(course.code);

                result.append(course.code)
                      .append(" | ")
                      .append(course.name)
                      .append(" | MARKS: ")
                      .append(marks)
                      .append(" | GRADE: ")
                      .append(marks >= 0 ? calculateGrade(marks) : "PENDING")
                      .append("\n");
            }
        }

        result.append("AVERAGE: ")
              .append(calculateAverage(studentId))
              .append("\n");

        result.append("GPA: ")
              .append(calculateGPA(studentId))
              .append("\n");

        return result.toString();
    }

    static double calculatePassPercentage(String courseCode) {
        int total = 0;
        int passed = 0;

        for (Student student : students) {
            if (student.marks.containsKey(courseCode)) {
                double marks = student.marks.get(courseCode);

                if (marks >= 0) {
                    total++;

                    if (marks > 50) {                         // BUG 6
                        passed++;
                    }
                }
            }
        }

        return total == 0 ? 0 : (passed * 100.0) / total;
    }

    static void seedDemoData() {
        addStudent(1, "Aarav");
        addStudent(2, "Riya");
        addStudent(3, "Kabir");

        addCourse("CS101", "Programming", 4);
        addCourse("CS102", "Data Structures", 4);
        addCourse("CS103", "Database Systems", 3);

        enrollStudent(1, "CS101");
        enrollStudent(1, "CS102");
        enrollStudent(1, "CS103");

        enrollStudent(2, "CS101");
        enrollStudent(2, "CS102");

        enrollStudent(3, "CS101");
        enrollStudent(3, "CS102");

        recordMarks(1, "CS101", 95);
        recordMarks(1, "CS102", 88);
        recordMarks(1, "CS103", 92);

        recordMarks(2, "CS101", 72);
        recordMarks(2, "CS102", 81);

        recordMarks(3, "CS101", 64);
        recordMarks(3, "CS102", 78);
    }

    public static void main(String[] args) {
        seedDemoData();

        Student topper = findTopper();

        if (topper != null) {
            System.out.println("TOPPER: " + topper.name);
            System.out.println("AVERAGE: " +
                    calculateAverage(topper.id));
        }

        System.out.println();
        System.out.println(generateTranscript(1));

        System.out.println("CS101 PASS %: " +
                calculatePassPercentage("CS101") + 100);      // BUG 7

        System.out.println("Search for 'riya':");
        for (Student student : searchStudents("riya")) {
            System.out.println(student.id + " - " + student.name);
        }

        System.out.println("GPA HEALTH CHECK: " +
                (calculateGPA(1) < 0));                       // BUG 8

        System.out.println("TOPPER ID CHECK: " +
                (findTopper() == null));                      // BUG 9
    }
}
```

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

Suggested task grouping:
- Developer 1: Bugs 1–3 — student lookup, marks, average.
- Developer 2: Bugs 4–6 — GPA, topper, pass rules.
- Developer 3: Bugs 7–9 — reporting and final validation.

============================================================
CODE MAFIA USAGE GUIDELINES
============================================================

These projects are intended to replace the simple mock-code examples when
the game needs a larger shared codebase.

For each generated match:

1. Select one project.
2. Use the correct version as the hidden canonical solution.
3. Give players only the buggy version.
4. Divide the code into logical developer responsibilities.
5. For 3 developers:
   - 3 tasks
   - 3 initial bugs per task
   - 9 total initial bugs
6. Randomly assign each developer task to a physical map room.
7. All developers edit the SAME shared Java source.
8. Mafia can add additional controlled bugs after the game starts.
9. Never reveal the bug manifest or canonical solution.
10. Groq should validate the current code against the project's original
    requirements, not merely compare text against the canonical solution.

============================================================
RECOMMENDED TASK DECOMPOSITION
============================================================

For a larger project, tasks should be generated from methods/function groups.

Example:

PROJECT:
Bank Management System

Developer 1:
Account lifecycle
- findAccount
- createAccount
- deposit
- withdraw

Developer 2:
Financial operations
- transfer
- calculateTotalBalance
- applyInterest
- transaction calculations

Developer 3:
Reporting
- freeze/unfreeze
- history
- summary
- output/verification

The exact task boundaries should be adapted to the generated project.

============================================================
RECOMMENDED BUG TYPES
============================================================

For future Groq-generated projects, bugs can be selected from:

- syntax
- wrong operator
- reversed condition
- off-by-one
- incorrect initialization
- wrong variable
- wrong return value
- wrong loop condition
- incorrect boundary
- incorrect null handling
- incorrect state update
- incorrect output
- incorrect aggregation
- incorrect comparison
- incorrect data structure operation

Every generated bug must:
- be intentional
- be independently fixable
- belong to a real code region
- not make the entire program impossible to repair
- have a clear original and buggy form
- be traceable to one developer task

============================================================
CANONICAL GAME DATA MODEL
============================================================

A generated project should eventually be represented approximately as:

{
  "projectId": "...",
  "problemStatement": "...",
  "language": "java",
  "canonicalSolution": "...",
  "initialBuggySolution": "...",
  "tasks": [
    {
      "taskId": "T1",
      "title": "...",
      "description": "...",
      "codeRegions": ["..."],
      "assignedDeveloper": "...",
      "assignedRoom": "..."
    }
  ],
  "bugs": [
    {
      "bugId": "B1",
      "taskId": "T1",
      "fileName": "Main.java",
      "method": "...",
      "line": 42,
      "type": "LOGICAL",
      "originalCode": "...",
      "buggyCode": "...",
      "fixed": false,
      "injectedBy": "INITIAL"
    }
  ]
}

Initial requirement:

bugs.length === 9

Mafia-added bugs are separate:

initialBugs = 9
mafiaInjectedBugs = 0..N

============================================================
FINAL IMPORTANT RULE
============================================================

These examples demonstrate the type of larger codebase Code Mafia should be
able to generate and debug.

The final dynamic system should eventually work for the 100-problem dataset:

DATASET
→ RANDOM PROBLEM
→ CANONICAL SOLUTION
→ TASK DECOMPOSITION
→ EXACTLY 9 INITIAL BUGS
→ RANDOM TASK/ROOM ASSIGNMENT
→ SHARED CODE
→ GAMEPLAY
→ GROQ VALIDATION
→ TASK COMPLETION
→ OVERALL SOLUTION VALIDATION
→ GAME WIN/LOSE
