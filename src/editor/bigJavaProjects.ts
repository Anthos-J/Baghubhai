/**
 * bigJavaProjects.ts
 *
 * 3 Larger Java Projects with Intentional Bugs extracted directly from
 * Code_Mafia_3_Big_Java_Projects_With_Bugs.md:
 * 1. Bank Management System (bank-management-system)
 * 2. Library Management System (library-management-system)
 * 3. Student Course & Result Management System (student-result-system)
 *
 * Each project contains:
 * - Full canonical correct Java code
 * - Full 9-bug Java code
 * - Exactly 9 isolated single-bug tasks (divided 3 each for 3 Developers)
 * - Deterministic lexical/token validators
 */

import { sanitizeSource, TestResult } from './testRunner';
import { JavaBugDefinition, JavaProblem } from './problemDataset';

function makeResult(taskId: string, testId: string, name: string, passed: boolean, message: string): TestResult[] {
  return [{
    testId,
    taskId,
    fileId: 'Main.java',
    name,
    passed,
    message,
  }];
}

// ═════════════════════════════════════════════════════════════════════════════
// PROJECT 1: BANK MANAGEMENT SYSTEM
// ═════════════════════════════════════════════════════════════════════════════

export const BANK_CORRECT = `import java.util.*;

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
        summary.append("TOTAL ACCOUNTS: ").append(accounts.size()).append("\\n");
        summary.append("TOTAL BALANCE: ").append(calculateTotalBalance()).append("\\n");

        for (Account account : accounts) {
            summary.append(account.accountNumber)
                   .append(" | ")
                   .append(account.holderName)
                   .append(" | ")
                   .append(account.balance)
                   .append("\\n");
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
                + calculateTotalBalance());

        System.out.println("Developer verification: " +
                (calculateTotalBalance() >= 0));
    }
}`;

export const BANK_FULL_BUGGY = `import java.util.*;

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
        summary.append("TOTAL ACCOUNTS: ").append(accounts.size()).append("\\n");
        summary.append("TOTAL BALANCE: ").append(calculateTotalBalance()).append("\\n");

        for (Account account : accounts) {
            summary.append(account.accountNumber)
                   .append(" | ")
                   .append(account.holderName)
                   .append(" | ")
                   .append(account.balance)
                   .append("\\n");
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
}`;

function buildBankBugs(): JavaBugDefinition[] {
  const pId = 'bank-management-system';
  return [
    {
      bugIndex: 1,
      id: `${pId}-bug-1`,
      title: 'Fix Account Lookup Condition (findAccount)',
      description: 'findAccount returns the first account whose number is NOT equal to the query!',
      hint: 'In findAccount, check if account.accountNumber == accountNumber instead of !=',
      buggyCode: `// MODULE: Account Lookup
static Account findAccount(int accountNumber) {
    for (Account account : accounts) {
        // BUG 1: Inverted lookup condition
        if (account.accountNumber != accountNumber) {
            return account;
        }
    }
    return null;
}`,
      solutionCode: `// MODULE: Account Lookup
static Account findAccount(int accountNumber) {
    for (Account account : accounts) {
        if (account.accountNumber == accountNumber) {
            return account;
        }
    }
    return null;
}`,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('account.accountNumber != accountNumber')) {
          return makeResult(`${pId}-bug-1`, 'bug1', 'Fix account lookup equality', false, 'FAILED: Must match account.accountNumber == accountNumber.');
        }
        if (!cleanCode.includes('account.accountNumber == accountNumber')) {
          return makeResult(`${pId}-bug-1`, 'bug1', 'Fix account lookup equality', false, 'FAILED: Expected equality check account.accountNumber == accountNumber.');
        }
        return makeResult(`${pId}-bug-1`, 'bug1', 'Fix account lookup equality', true, 'PASSED: Account lookup correctly checks equality.');
      },
    },
    {
      bugIndex: 2,
      id: `${pId}-bug-2`,
      title: 'Reject Zero & Negative Deposit Amounts (deposit)',
      description: 'deposit accepts zero amount because it checks amount < 0 instead of amount <= 0.',
      hint: 'Ensure deposit rejects amount <= 0.',
      buggyCode: `// MODULE: Deposits
static boolean deposit(int accountNumber, double amount) {
    Account account = findAccount(accountNumber);

    // BUG 2: Zero amount is erroneously allowed
    if (account == null || account.frozen || amount < 0) {
        return false;
    }

    account.balance += amount;
    account.transactions.add("DEPOSIT: " + amount);
    return true;
}`,
      solutionCode: `// MODULE: Deposits
static boolean deposit(int accountNumber, double amount) {
    Account account = findAccount(accountNumber);

    if (account == null || account.frozen || amount <= 0) {
        return false;
    }

    account.balance += amount;
    account.transactions.add("DEPOSIT: " + amount);
    return true;
}`,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('amount < 0') && !cleanCode.includes('amount <= 0')) {
          return makeResult(`${pId}-bug-2`, 'bug2', 'Reject zero deposit', false, 'FAILED: amount <= 0 must be rejected.');
        }
        return makeResult(`${pId}-bug-2`, 'bug2', 'Reject zero deposit', true, 'PASSED: Zero and negative deposits correctly rejected.');
      },
    },
    {
      bugIndex: 3,
      id: `${pId}-bug-3`,
      title: 'Allow Withdrawing Entire Balance (withdraw)',
      description: 'withdraw rejects withdrawing the entire balance because of amount >= account.balance.',
      hint: 'Change amount >= account.balance to amount > account.balance.',
      buggyCode: `// MODULE: Withdrawals
static boolean withdraw(int accountNumber, double amount) {
    Account account = findAccount(accountNumber);

    // BUG 3: Rejects exact balance withdrawal
    if (account == null || account.frozen || amount <= 0 ||
            amount >= account.balance) {
        return false;
    }

    account.balance -= amount;
    account.transactions.add("WITHDRAW: " + amount);
    return true;
}`,
      solutionCode: `// MODULE: Withdrawals
static boolean withdraw(int accountNumber, double amount) {
    Account account = findAccount(accountNumber);

    if (account == null || account.frozen || amount <= 0 ||
            amount > account.balance) {
        return false;
    }

    account.balance -= amount;
    account.transactions.add("WITHDRAW: " + amount);
    return true;
}`,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('amount >= account.balance')) {
          return makeResult(`${pId}-bug-3`, 'bug3', 'Allow exact balance withdrawal', false, 'FAILED: Change amount >= account.balance to amount > account.balance.');
        }
        return makeResult(`${pId}-bug-3`, 'bug3', 'Allow exact balance withdrawal', true, 'PASSED: Exact balance withdrawals permitted.');
      },
    },
    {
      bugIndex: 4,
      id: `${pId}-bug-4`,
      title: 'Reject Zero Value Transfers (transfer)',
      description: 'transfer accepts 0 as a valid transfer amount because of amount < 0.',
      hint: 'Change amount < 0 to amount <= 0 in transfer validation.',
      buggyCode: `// MODULE: Transfers
static boolean transfer(int fromAccount, int toAccount, double amount) {
    Account sender = findAccount(fromAccount);
    Account receiver = findAccount(toAccount);

    // BUG 4: Accepts zero transfer amount
    if (sender == null || receiver == null || sender.frozen ||
            receiver.frozen || amount < 0 ||
            amount > sender.balance) {
        return false;
    }

    sender.balance -= amount;
    receiver.balance += amount;

    sender.transactions.add("TRANSFER OUT: " + amount + " TO " + toAccount);
    receiver.transactions.add("TRANSFER IN: " + amount + " FROM " + fromAccount);

    return true;
}`,
      solutionCode: `// MODULE: Transfers
static boolean transfer(int fromAccount, int toAccount, double amount) {
    Account sender = findAccount(fromAccount);
    Account receiver = findAccount(toAccount);

    if (sender == null || receiver == null || sender.frozen ||
            receiver.frozen || amount <= 0 ||
            amount > sender.balance) {
        return false;
    }

    sender.balance -= amount;
    receiver.balance += amount;

    sender.transactions.add("TRANSFER OUT: " + amount + " TO " + toAccount);
    receiver.transactions.add("TRANSFER IN: " + amount + " FROM " + fromAccount);

    return true;
}`,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('amount < 0') && !cleanCode.includes('amount <= 0')) {
          return makeResult(`${pId}-bug-4`, 'bug4', 'Reject zero transfer', false, 'FAILED: Must reject amount <= 0.');
        }
        return makeResult(`${pId}-bug-4`, 'bug4', 'Reject zero transfer', true, 'PASSED: Zero transfer rejected.');
      },
    },
    {
      bugIndex: 5,
      id: `${pId}-bug-5`,
      title: 'Fix Total Balance Summation (calculateTotalBalance)',
      description: 'calculateTotalBalance subtracts account balances instead of accumulating them.',
      hint: 'Change total -= account.balance to total += account.balance.',
      buggyCode: `// MODULE: Total Balance Aggregator
static double calculateTotalBalance() {
    double total = 0;

    for (Account account : accounts) {
        // BUG 5: Subtracts instead of accumulating
        total -= account.balance;
    }

    return total;
}`,
      solutionCode: `// MODULE: Total Balance Aggregator
static double calculateTotalBalance() {
    double total = 0;

    for (Account account : accounts) {
        total += account.balance;
    }

    return total;
}`,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('total -= account.balance')) {
          return makeResult(`${pId}-bug-5`, 'bug5', 'Accumulate total balance', false, 'FAILED: Must add balances total += account.balance.');
        }
        return makeResult(`${pId}-bug-5`, 'bug5', 'Accumulate total balance', true, 'PASSED: Total balance correctly accumulated.');
      },
    },
    {
      bugIndex: 6,
      id: `${pId}-bug-6`,
      title: 'Allow Zero Annual Interest Rate (applyInterest)',
      description: 'applyInterest rejects annualRate == 0 as invalid.',
      hint: 'Change annualRate <= 0 to annualRate < 0 so 0 rate is handled cleanly without early rejection.',
      buggyCode: `// MODULE: Interest Application
static void applyInterest(double annualRate) {
    // BUG 6: Erroneously rejects 0% interest rate
    if (annualRate <= 0) {
        return;
    }

    for (Account account : accounts) {
        if (!account.frozen) {
            double interest = account.balance * annualRate / 100.0;
            account.balance += interest;
            account.transactions.add("INTEREST: " + interest);
        }
    }
}`,
      solutionCode: `// MODULE: Interest Application
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
}`,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('annualRate <= 0')) {
          return makeResult(`${pId}-bug-6`, 'bug6', 'Allow 0 percent interest', false, 'FAILED: Change annualRate <= 0 to annualRate < 0.');
        }
        return makeResult(`${pId}-bug-6`, 'bug6', 'Allow 0 percent interest', true, 'PASSED: Zero interest rate allowed.');
      },
    },
    {
      bugIndex: 7,
      id: `${pId}-bug-7`,
      title: 'Fix Account Freeze Status Inversion (setFreezeStatus)',
      description: 'setFreezeStatus assigns account.frozen = !frozen, inverting the requested status!',
      hint: 'Assign account.frozen = frozen directly.',
      buggyCode: `// MODULE: Account Status Management
static boolean setFreezeStatus(int accountNumber, boolean frozen) {
    Account account = findAccount(accountNumber);

    if (account == null) {
        return false;
    }

    // BUG 7: Inverted freeze status assignment
    account.frozen = !frozen;
    account.transactions.add(frozen ? "ACCOUNT FROZEN" : "ACCOUNT UNFROZEN");
    return true;
}`,
      solutionCode: `// MODULE: Account Status Management
static boolean setFreezeStatus(int accountNumber, boolean frozen) {
    Account account = findAccount(accountNumber);

    if (account == null) {
        return false;
    }

    account.frozen = frozen;
    account.transactions.add(frozen ? "ACCOUNT FROZEN" : "ACCOUNT UNFROZEN");
    return true;
}`,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('account.frozen = !frozen')) {
          return makeResult(`${pId}-bug-7`, 'bug7', 'Fix freeze status assignment', false, 'FAILED: Do not invert frozen status with !frozen.');
        }
        return makeResult(`${pId}-bug-7`, 'bug7', 'Fix freeze status assignment', true, 'PASSED: Freeze status correctly assigned.');
      },
    },
    {
      bugIndex: 8,
      id: `${pId}-bug-8`,
      title: 'Restore Non-Negative Bank Total (calculateTotalBalance call)',
      description: 'Ensure total calculation is correctly referenced and verified.',
      hint: 'Ensure calculateTotalBalance() result is valid and verified positively.',
      buggyCode: `// MODULE: Verification Print
System.out.println("Bank total after interest: " + (calculateTotalBalance() * 0));`,
      solutionCode: `// MODULE: Verification Print
System.out.println("Bank total after interest: " + calculateTotalBalance());`,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('* 0') || cleanCode.includes('0 *')) {
          return makeResult(`${pId}-bug-8`, 'bug8', 'Restore total calculation', false, 'FAILED: calculateTotalBalance must not be multiplied by 0.');
        }
        return makeResult(`${pId}-bug-8`, 'bug8', 'Restore total calculation', true, 'PASSED: Total calculation output restored.');
      },
    },
    {
      bugIndex: 9,
      id: `${pId}-bug-9`,
      title: 'Fix Developer Verification Condition (main)',
      description: 'Verification check interprets negative total balance as valid (< 0).',
      hint: 'Change (calculateTotalBalance() < 0) to (calculateTotalBalance() >= 0).',
      buggyCode: `// MODULE: Developer Verification Condition
System.out.println("Developer verification: " +
        (calculateTotalBalance() < 0)); // BUG 9: Expected non-negative`,
      solutionCode: `// MODULE: Developer Verification Condition
System.out.println("Developer verification: " +
        (calculateTotalBalance() >= 0));`,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('calculateTotalBalance() < 0')) {
          return makeResult(`${pId}-bug-9`, 'bug9', 'Fix verification condition', false, 'FAILED: Balance verification must be >= 0.');
        }
        return makeResult(`${pId}-bug-9`, 'bug9', 'Fix verification condition', true, 'PASSED: Verification condition checks non-negative balance.');
      },
    },
  ];
}

// ═════════════════════════════════════════════════════════════════════════════
// PROJECT 2: LIBRARY MANAGEMENT SYSTEM
// ═════════════════════════════════════════════════════════════════════════════

export const LIBRARY_CORRECT = `import java.util.*;

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
                "\\nMEMBERS: " + totalMembers +
                "\\nISSUED: " + issuedBooks +
                "\\nAVAILABLE: " + availableBooks;
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
}`;

export const LIBRARY_FULL_BUGGY = `import java.util.*;

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
                "\\nMEMBERS: " + totalMembers +
                "\\nISSUED: " + issuedBooks +
                "\\nAVAILABLE: " + availableBooks;
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
}`;

function buildLibraryBugs(): JavaBugDefinition[] {
  const pId = 'library-management-system';
  return [
    {
      bugIndex: 1,
      id: `${pId}-bug-1`,
      title: 'Fix Book Lookup Equality (findBook)',
      description: 'findBook returns the first book whose ID is NOT equal (!= id).',
      hint: 'Change book.id != id to book.id == id.',
      buggyCode: `// MODULE: Book Search
static Book findBook(int id) {
    for (Book book : books) {
        // BUG 1: Inverted book match
        if (book.id != id) {
            return book;
        }
    }
    return null;
}`,
      solutionCode: `// MODULE: Book Search
static Book findBook(int id) {
    for (Book book : books) {
        if (book.id == id) {
            return book;
        }
    }
    return null;
}`,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('book.id != id')) {
          return makeResult(`${pId}-bug-1`, 'bug1', 'Fix book id equality', false, 'FAILED: book.id == id must be checked.');
        }
        return makeResult(`${pId}-bug-1`, 'bug1', 'Fix book id equality', true, 'PASSED: Book lookup correctly checks equality.');
      },
    },
    {
      bugIndex: 2,
      id: `${pId}-bug-2`,
      title: 'Disallow Removing Issued Books (removeBook)',
      description: 'removeBook incorrectly allows only issued books to be removed (!book.issued).',
      hint: 'Prevent removing a book if book == null || book.issued.',
      buggyCode: `// MODULE: Book Removal
static boolean removeBook(int id) {
    Book book = findBook(id);

    // BUG 2: Prevents removing unissued books, allows removing issued ones!
    if (book == null || !book.issued) {
        return false;
    }

    return books.remove(book);
}`,
      solutionCode: `// MODULE: Book Removal
static boolean removeBook(int id) {
    Book book = findBook(id);

    if (book == null || book.issued) {
        return false;
    }

    return books.remove(book);
}`,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('!book.issued')) {
          return makeResult(`${pId}-bug-2`, 'bug2', 'Disallow removing issued books', false, 'FAILED: Cannot remove if book.issued.');
        }
        return makeResult(`${pId}-bug-2`, 'bug2', 'Disallow removing issued books', true, 'PASSED: Only non-issued books can be removed.');
      },
    },
    {
      bugIndex: 3,
      id: `${pId}-bug-3`,
      title: 'Fix Book Issuing Condition (issueBook)',
      description: 'issueBook rejects available books and only accepts already issued books (!book.issued).',
      hint: 'A book can only be issued if book != null && member != null && !book.issued (reject if book.issued).',
      buggyCode: `// MODULE: Book Issue Operations
static boolean issueBook(int bookId, int memberId) {
    Book book = findBook(bookId);
    Member member = findMember(memberId);

    // BUG 3: Rejects available books
    if (book == null || member == null || !book.issued) {
        return false;
    }

    book.issued = true;
    book.issuedToMember = memberId;
    member.borrowedBooks.add(bookId);
    member.history.add("ISSUED: " + bookId);

    return true;
}`,
      solutionCode: `// MODULE: Book Issue Operations
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
}`,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('!book.issued')) {
          return makeResult(`${pId}-bug-3`, 'bug3', 'Fix book issue condition', false, 'FAILED: Reject issuing if book.issued is true.');
        }
        return makeResult(`${pId}-bug-3`, 'bug3', 'Fix book issue condition', true, 'PASSED: Book issuing logic verified.');
      },
    },
    {
      bugIndex: 4,
      id: `${pId}-bug-4`,
      title: 'Fix Overdue Fine Day Boundary (calculateFine)',
      description: 'calculateFine allows 0 overdue days to be charged (overdueDays < 0).',
      hint: 'Change overdueDays < 0 to overdueDays <= 0 to return 0 for zero days.',
      buggyCode: `// MODULE: Fine Calculation
static double calculateFine(int overdueDays) {
    // BUG 4: Erroneously fines for 0 overdue days
    if (overdueDays < 0) {
        return 0;
    }

    return overdueDays * 5.0;
}`,
      solutionCode: `// MODULE: Fine Calculation
static double calculateFine(int overdueDays) {
    if (overdueDays <= 0) {
        return 0;
    }

    return overdueDays * 5.0;
}`,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('overdueDays < 0') && !cleanCode.includes('overdueDays <= 0')) {
          return makeResult(`${pId}-bug-4`, 'bug4', 'No fine for zero overdue days', false, 'FAILED: Change overdueDays < 0 to overdueDays <= 0.');
        }
        return makeResult(`${pId}-bug-4`, 'bug4', 'No fine for zero overdue days', true, 'PASSED: Zero overdue days incur no fine.');
      },
    },
    {
      bugIndex: 5,
      id: `${pId}-bug-5`,
      title: 'Return Only Unissued Books (getAvailableBooks)',
      description: 'getAvailableBooks includes book.issued instead of !book.issued.',
      hint: 'Available books must satisfy !book.issued.',
      buggyCode: `// MODULE: Available Books Filter
static List<Book> getAvailableBooks() {
    List<Book> available = new ArrayList<>();

    for (Book book : books) {
        // BUG 5: Returns issued books instead of available books!
        if (book.issued) {
            available.add(book);
        }
    }

    return available;
}`,
      solutionCode: `// MODULE: Available Books Filter
static List<Book> getAvailableBooks() {
    List<Book> available = new ArrayList<>();

    for (Book book : books) {
        if (!book.issued) {
            available.add(book);
        }
    }

    return available;
}`,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('if (book.issued)') || cleanCode.includes('if(book.issued)')) {
          return makeResult(`${pId}-bug-5`, 'bug5', 'Filter unissued books', false, 'FAILED: Available books must be !book.issued.');
        }
        return makeResult(`${pId}-bug-5`, 'bug5', 'Filter unissued books', true, 'PASSED: Unissued books correctly returned.');
      },
    },
    {
      bugIndex: 6,
      id: `${pId}-bug-6`,
      title: 'Count Issued Books Correctly (getBorrowedBookCount)',
      description: 'getBorrowedBookCount counts !book.issued instead of book.issued.',
      hint: 'Borrowed books are those with book.issued == true.',
      buggyCode: `// MODULE: Borrowed Book Counter
static int getBorrowedBookCount() {
    int count = 0;

    for (Book book : books) {
        // BUG 6: Inverted count
        if (!book.issued) {
            count++;
        }
    }

    return count;
}`,
      solutionCode: `// MODULE: Borrowed Book Counter
static int getBorrowedBookCount() {
    int count = 0;

    for (Book book : books) {
        if (book.issued) {
            count++;
        }
    }

    return count;
}`,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('if (!book.issued)') || cleanCode.includes('if(!book.issued)')) {
          return makeResult(`${pId}-bug-6`, 'bug6', 'Count issued books', false, 'FAILED: Must count book.issued.');
        }
        return makeResult(`${pId}-bug-6`, 'bug6', 'Count issued books', true, 'PASSED: Borrowed books correctly counted.');
      },
    },
    {
      bugIndex: 7,
      id: `${pId}-bug-7`,
      title: 'Fix Book Display Status Text (displayBook)',
      description: 'displayBook outputs "AVAILABLE" when book.issued is true and "ISSUED" when false.',
      hint: 'Swap the status strings to (book.issued ? "ISSUED" : "AVAILABLE").',
      buggyCode: `// MODULE: Book Display
static void displayBook(int bookId) {
    Book book = findBook(bookId);

    if (book == null) {
        System.out.println("Book not found.");
        return;
    }

    // BUG 7: Inverted status label
    System.out.println(book.id + " | " + book.title + " | " +
            book.author + " | " +
            (book.issued ? "AVAILABLE" : "ISSUED"));
}`,
      solutionCode: `// MODULE: Book Display
static void displayBook(int bookId) {
    Book book = findBook(bookId);

    if (book == null) {
        System.out.println("Book not found.");
        return;
    }

    System.out.println(book.id + " | " + book.title + " | " +
            book.author + " | " +
            (book.issued ? "ISSUED" : "AVAILABLE"));
}`,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('book.issued ? "AVAILABLE" : "ISSUED"')) {
          return makeResult(`${pId}-bug-7`, 'bug7', 'Fix display status strings', false, 'FAILED: book.issued must display "ISSUED".');
        }
        return makeResult(`${pId}-bug-7`, 'bug7', 'Fix display status strings', true, 'PASSED: Display status label properly mapped.');
      },
    },
    {
      bugIndex: 8,
      id: `${pId}-bug-8`,
      title: 'Remove Erroneous Fine Surcharge in Output (main)',
      description: 'The return output adds an extra 5 to the fine: System.out.println("Fine: " + (fine + 5)).',
      hint: 'Change (fine + 5) to fine.',
      buggyCode: `// MODULE: Fine Reporting
double fine = returnBook(1, 101, 3);
// BUG 8: Erroneous +5 surcharge
System.out.println("Fine: " + (fine + 5));`,
      solutionCode: `// MODULE: Fine Reporting
double fine = returnBook(1, 101, 3);
System.out.println("Fine: " + fine);`,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('fine + 5') || cleanCode.includes('5 + fine')) {
          return makeResult(`${pId}-bug-8`, 'bug8', 'Remove fine surcharge', false, 'FAILED: Remove the +5 surcharge from the fine print.');
        }
        return makeResult(`${pId}-bug-8`, 'bug8', 'Remove fine surcharge', true, 'PASSED: Fine reported accurately without surcharge.');
      },
    },
    {
      bugIndex: 9,
      id: `${pId}-bug-9`,
      title: 'Fix Library Overload Validation Condition (main)',
      description: 'The overload check uses an impossible condition (getBorrowedBookCount() > books.size()).',
      hint: 'Ensure overload check evaluates books and members validly.',
      buggyCode: `// MODULE: Overload Health Check
// BUG 9: Inverted/impossible condition
if (getBorrowedBookCount() > books.size() * 2) {
    System.out.println("Library overload detected");
}`,
      solutionCode: `// MODULE: Overload Health Check
if (getBorrowedBookCount() > books.size()) {
    System.out.println("Library overload detected");
}`,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('* 2') || cleanCode.includes('2 *')) {
          return makeResult(`${pId}-bug-9`, 'bug9', 'Fix overload check', false, 'FAILED: Remove artificial factor from overload check.');
        }
        return makeResult(`${pId}-bug-9`, 'bug9', 'Fix overload check', true, 'PASSED: Overload check verified.');
      },
    },
  ];
}

// ═════════════════════════════════════════════════════════════════════════════
// PROJECT 3: STUDENT COURSE / RESULT MANAGEMENT SYSTEM
// ═════════════════════════════════════════════════════════════════════════════

export const STUDENT_CORRECT = `import java.util.*;

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
              .append(")\\n");

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
                      .append("\\n");
            }
        }

        result.append("AVERAGE: ")
              .append(calculateAverage(studentId))
              .append("\\n");

        result.append("GPA: ")
              .append(calculateGPA(studentId))
              .append("\\n");

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
}`;

export const STUDENT_FULL_BUGGY = `import java.util.*;

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
              .append(")\\n");

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
                      .append("\\n");
            }
        }

        result.append("AVERAGE: ")
              .append(calculateAverage(studentId))
              .append("\\n");

        result.append("GPA: ")
              .append(calculateGPA(studentId))
              .append("\\n");

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
}`;

function buildStudentBugs(): JavaBugDefinition[] {
  const pId = 'student-result-system';
  return [
    {
      bugIndex: 1,
      id: `${pId}-bug-1`,
      title: 'Fix Student Lookup Equality (findStudent)',
      description: 'findStudent returns the first student whose ID is NOT equal (!= id).',
      hint: 'Change student.id != id to student.id == id.',
      buggyCode: `// MODULE: Student Lookup
static Student findStudent(int id) {
    for (Student student : students) {
        // BUG 1: Inverted equality check
        if (student.id != id) {
            return student;
        }
    }
    return null;
}`,
      solutionCode: `// MODULE: Student Lookup
static Student findStudent(int id) {
    for (Student student : students) {
        if (student.id == id) {
            return student;
        }
    }
    return null;
}`,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('student.id != id')) {
          return makeResult(`${pId}-bug-1`, 'bug1', 'Fix student lookup equality', false, 'FAILED: Must match student.id == id.');
        }
        return makeResult(`${pId}-bug-1`, 'bug1', 'Fix student lookup equality', true, 'PASSED: Student lookup correctly checks equality.');
      },
    },
    {
      bugIndex: 2,
      id: `${pId}-bug-2`,
      title: 'Allow Zero Marks to be Recorded (recordMarks)',
      description: 'recordMarks incorrectly rejects a mark of 0 because it checks marks <= 0.',
      hint: 'Change marks <= 0 to marks < 0 (0 is a valid examination mark).',
      buggyCode: `// MODULE: Grade Book / Recording
static boolean recordMarks(int studentId, String courseCode, double marks) {
    Student student = findStudent(studentId);
    Course course = findCourse(courseCode);

    // BUG 2: Rejects 0 marks
    if (student == null || course == null ||
            !student.marks.containsKey(courseCode) ||
            marks <= 0 || marks > 100) {
        return false;
    }

    student.marks.put(courseCode, marks);
    return true;
}`,
      solutionCode: `// MODULE: Grade Book / Recording
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
}`,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('marks <= 0')) {
          return makeResult(`${pId}-bug-2`, 'bug2', 'Allow 0 marks', false, 'FAILED: Change marks <= 0 to marks < 0.');
        }
        return makeResult(`${pId}-bug-2`, 'bug2', 'Allow 0 marks', true, 'PASSED: Zero mark accepted.');
      },
    },
    {
      bugIndex: 3,
      id: `${pId}-bug-3`,
      title: 'Fix Average Mark Summation (calculateAverage)',
      description: 'calculateAverage subtracts marks instead of accumulating them (total -= mark).',
      hint: 'Change total -= mark to total += mark.',
      buggyCode: `// MODULE: Academic Average Calculator
static double calculateAverage(int studentId) {
    Student student = findStudent(studentId);

    if (student == null || student.marks.isEmpty()) {
        return 0;
    }

    double total = 0;
    int count = 0;

    for (double mark : student.marks.values()) {
        if (mark >= 0) {
            // BUG 3: Subtracts marks instead of adding
            total -= mark;
            count++;
        }
    }

    return count == 0 ? 0 : total / count;
}`,
      solutionCode: `// MODULE: Academic Average Calculator
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
}`,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('total -= mark')) {
          return makeResult(`${pId}-bug-3`, 'bug3', 'Sum average marks', false, 'FAILED: Must add marks total += mark.');
        }
        return makeResult(`${pId}-bug-3`, 'bug3', 'Sum average marks', true, 'PASSED: Marks correctly accumulated.');
      },
    },
    {
      bugIndex: 4,
      id: `${pId}-bug-4`,
      title: 'Fix GPA Total Credits Accumulation (calculateGPA)',
      description: 'calculateGPA subtracts course credits (totalCredits -= course.credits).',
      hint: 'Change totalCredits -= course.credits to totalCredits += course.credits.',
      buggyCode: `// MODULE: GPA Calculation
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
                // BUG 4: Decrements credits instead of adding
                totalCredits -= course.credits;
            }
        }
    }

    return totalCredits == 0 ? 0 : weightedPoints / totalCredits;
}`,
      solutionCode: `// MODULE: GPA Calculation
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
}`,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('totalCredits -= course.credits')) {
          return makeResult(`${pId}-bug-4`, 'bug4', 'Accumulate GPA credits', false, 'FAILED: Must add credits totalCredits += course.credits.');
        }
        return makeResult(`${pId}-bug-4`, 'bug4', 'Accumulate GPA credits', true, 'PASSED: Total credits properly accumulated.');
      },
    },
    {
      bugIndex: 5,
      id: `${pId}-bug-5`,
      title: 'Fix Initial Baseline for Topper Search (findTopper)',
      description: 'findTopper starts bestAverage at 0 instead of -1, failing if student averages are 0.',
      hint: 'Initialize double bestAverage = -1.',
      buggyCode: `// MODULE: Topper Detection
static Student findTopper() {
    Student topper = null;
    // BUG 5: Starts at 0, misses valid student with 0 average
    double bestAverage = 0;

    for (Student student : students) {
        double average = calculateAverage(student.id);

        if (average > bestAverage) {
            bestAverage = average;
            topper = student;
        }
    }

    return topper;
}`,
      solutionCode: `// MODULE: Topper Detection
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
}`,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('bestAverage = 0;') || cleanCode.includes('bestAverage = 0.0;')) {
          return makeResult(`${pId}-bug-5`, 'bug5', 'Initialize topper baseline', false, 'FAILED: Initialize bestAverage to -1.');
        }
        return makeResult(`${pId}-bug-5`, 'bug5', 'Initialize topper baseline', true, 'PASSED: Topper baseline initialized correctly.');
      },
    },
    {
      bugIndex: 6,
      id: `${pId}-bug-6`,
      title: 'Include Exactly 50 Marks as Passing (calculatePassPercentage)',
      description: 'calculatePassPercentage checks marks > 50 instead of marks >= 50.',
      hint: 'Change marks > 50 to marks >= 50 so 50 is treated as a passing grade.',
      buggyCode: `// MODULE: Pass Rate Statistics
static double calculatePassPercentage(String courseCode) {
    int total = 0;
    int passed = 0;

    for (Student student : students) {
        if (student.marks.containsKey(courseCode)) {
            double marks = student.marks.get(courseCode);

            if (marks >= 0) {
                total++;

                // BUG 6: Excludes students who got exactly 50
                if (marks > 50) {
                    passed++;
                }
            }
        }
    }

    return total == 0 ? 0 : (passed * 100.0) / total;
}`,
      solutionCode: `// MODULE: Pass Rate Statistics
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
}`,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('marks > 50') && !cleanCode.includes('marks >= 50')) {
          return makeResult(`${pId}-bug-6`, 'bug6', 'Pass condition includes 50', false, 'FAILED: Change marks > 50 to marks >= 50.');
        }
        return makeResult(`${pId}-bug-6`, 'bug6', 'Pass condition includes 50', true, 'PASSED: 50 is recognized as passing.');
      },
    },
    {
      bugIndex: 7,
      id: `${pId}-bug-7`,
      title: 'Remove Corruption from Pass Percentage Output (main)',
      description: 'The pass percentage output adds 100 to the percentage value.',
      hint: 'Remove "+ 100" from the calculatePassPercentage("CS101") output expression.',
      buggyCode: `// MODULE: Result Reporting
// BUG 7: Artificially adds 100 to pass percentage
System.out.println("CS101 PASS %: " +
        (calculatePassPercentage("CS101") + 100));`,
      solutionCode: `// MODULE: Result Reporting
System.out.println("CS101 PASS %: " +
        calculatePassPercentage("CS101"));`,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('calculatePassPercentage("CS101") + 100') || cleanCode.includes('100 + calculatePassPercentage("CS101")')) {
          return makeResult(`${pId}-bug-7`, 'bug7', 'Clean pass percentage output', false, 'FAILED: Remove + 100 corruption.');
        }
        return makeResult(`${pId}-bug-7`, 'bug7', 'Clean pass percentage output', true, 'PASSED: Pass percentage output verified.');
      },
    },
    {
      bugIndex: 8,
      id: `${pId}-bug-8`,
      title: 'Fix GPA Health Check Condition (main)',
      description: 'Health check considers GPA < 0 as healthy instead of >= 0.',
      hint: 'Change (calculateGPA(1) < 0) to (calculateGPA(1) >= 0).',
      buggyCode: `// MODULE: GPA Health Check
System.out.println("GPA HEALTH CHECK: " +
        (calculateGPA(1) < 0)); // BUG 8: Inverted check`,
      solutionCode: `// MODULE: GPA Health Check
System.out.println("GPA HEALTH CHECK: " +
        (calculateGPA(1) >= 0));`,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('calculateGPA(1) < 0')) {
          return makeResult(`${pId}-bug-8`, 'bug8', 'Fix GPA health check', false, 'FAILED: Check calculateGPA(1) >= 0.');
        }
        return makeResult(`${pId}-bug-8`, 'bug8', 'Fix GPA health check', true, 'PASSED: GPA health check verified.');
      },
    },
    {
      bugIndex: 9,
      id: `${pId}-bug-9`,
      title: 'Fix Topper ID Check Condition (main)',
      description: 'Topper check incorrectly asserts (findTopper() == null).',
      hint: 'Change (findTopper() == null) to (findTopper() != null).',
      buggyCode: `// MODULE: Topper Verification
System.out.println("TOPPER ID CHECK: " +
        (findTopper() == null)); // BUG 9: Expected non-null topper`,
      solutionCode: `// MODULE: Topper Verification
System.out.println("TOPPER ID CHECK: " +
        (findTopper() != null));`,
      validator: (code: string) => {
        const { cleanCode } = sanitizeSource(code);
        if (cleanCode.includes('findTopper() == null')) {
          return makeResult(`${pId}-bug-9`, 'bug9', 'Fix topper non-null check', false, 'FAILED: Check findTopper() != null.');
        }
        return makeResult(`${pId}-bug-9`, 'bug9', 'Fix topper non-null check', true, 'PASSED: Topper check verified non-null.');
      },
    },
  ];
}

// ═════════════════════════════════════════════════════════════════════════════
// EXPORT ALL 3 RICH PROJECTS
// ═════════════════════════════════════════════════════════════════════════════

export const BIG_JAVA_PROJECTS: JavaProblem[] = [
  {
    id: 'bank-management-system',
    title: 'Bank Management System',
    description: 'Console-based Bank Management System in Java with accounts, deposits, withdrawals, transfers, interest, and freeze management.',
    correctCode: BANK_CORRECT,
    buggyFullCode: BANK_FULL_BUGGY,
    bugs: buildBankBugs(),
  },
  {
    id: 'library-management-system',
    title: 'Library Management System',
    description: 'Console-based Library Management System in Java with book inventory, member registers, issue/return cycles, fines, and statistics.',
    correctCode: LIBRARY_CORRECT,
    buggyFullCode: LIBRARY_FULL_BUGGY,
    bugs: buildLibraryBugs(),
  },
  {
    id: 'student-result-system',
    title: 'Student Course & Result System',
    description: 'Console-based Student Course and Result Management System with students, courses, grades, GPA calculations, transcripts, and toppers.',
    correctCode: STUDENT_CORRECT,
    buggyFullCode: STUDENT_FULL_BUGGY,
    bugs: buildStudentBugs(),
  },
];
