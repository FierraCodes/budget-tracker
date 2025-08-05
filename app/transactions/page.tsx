"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, ArrowLeft, Wallet, Filter } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

interface Account {
  id: string
  name: string
  balance: number
  type: "checking" | "savings" | "credit" | "investment"
}

interface Transaction {
  id: string
  accountId: string
  type: "income" | "expense" | "transfer"
  amount: number
  category: string
  subcategory: string
  description: string
  date: string
}

const defaultCategories = {
  income: {
    Salary: ["Regular Pay", "Overtime", "Bonus"],
    Business: ["Sales", "Services", "Consulting"],
    Investment: ["Dividends", "Interest", "Capital Gains"],
    Other: ["Gifts", "Refunds", "Miscellaneous"],
  },
  expense: {
    Food: ["Groceries", "Restaurants", "Coffee"],
    Transportation: ["Gas", "Public Transit", "Parking"],
    Housing: ["Rent", "Utilities", "Maintenance"],
    Entertainment: ["Movies", "Games", "Subscriptions"],
    Healthcare: ["Doctor", "Pharmacy", "Insurance"],
    Shopping: ["Clothing", "Electronics", "Home"],
    Other: ["Fees", "Taxes", "Miscellaneous"],
  },
  transfer: {
    Transfer: ["Between Accounts", "To Savings", "From Savings"],
  },
}

export default function TransactionsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [filterType, setFilterType] = useState<string>("all")
  const [filterAccount, setFilterAccount] = useState<string>("all")
  const [newTransaction, setNewTransaction] = useState({
    accountId: "",
    toAccountId: "",
    type: "expense" as "income" | "expense" | "transfer",
    amount: "",
    category: "",
    subcategory: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  })

  useEffect(() => {
    const savedAccounts = localStorage.getItem("money-manager-accounts")
    const savedTransactions = localStorage.getItem("money-manager-transactions")
    if (savedAccounts) setAccounts(JSON.parse(savedAccounts))
    if (savedTransactions) {
      const txns = JSON.parse(savedTransactions)
      setTransactions(txns)
      setFilteredTransactions(txns)
    }
  }, [])

  useEffect(() => {
    let filtered = transactions

    if (filterType !== "all") {
      filtered = filtered.filter((t) => t.type === filterType)
    }

    if (filterAccount !== "all") {
      filtered = filtered.filter((t) => t.accountId === filterAccount)
    }

    setFilteredTransactions(filtered)
  }, [transactions, filterType, filterAccount])

  const saveTransactions = (updatedTransactions: Transaction[]) => {
    setTransactions(updatedTransactions)
    localStorage.setItem("money-manager-transactions", JSON.stringify(updatedTransactions))
  }

  const updateAccountBalances = (transaction: Transaction, isDelete = false) => {
    const updatedAccounts = accounts.map((account) => {
      if (account.id === transaction.accountId) {
        let balanceChange = transaction.amount
        if (transaction.type === "expense" || (transaction.type === "transfer" && !isDelete)) {
          balanceChange = -balanceChange
        }
        if (isDelete) balanceChange = -balanceChange

        return { ...account, balance: account.balance + balanceChange }
      }
      return account
    })

    setAccounts(updatedAccounts)
    localStorage.setItem("money-manager-accounts", JSON.stringify(updatedAccounts))
  }

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTransaction.accountId || !newTransaction.amount || !newTransaction.category) return

    const transaction: Transaction = {
      id: Date.now().toString(),
      accountId: newTransaction.accountId,
      type: newTransaction.type,
      amount: Number.parseFloat(newTransaction.amount),
      category: newTransaction.category,
      subcategory: newTransaction.subcategory,
      description: newTransaction.description,
      date: newTransaction.date,
    }

    const updatedTransactions = [...transactions, transaction]
    saveTransactions(updatedTransactions)
    updateAccountBalances(transaction)

    setNewTransaction({
      accountId: "",
      toAccountId: "",
      type: "expense",
      amount: "",
      category: "",
      subcategory: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    })
    setIsAddDialogOpen(false)
  }

  const handleEditTransaction = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTransaction || !newTransaction.accountId || !newTransaction.amount || !newTransaction.category) return

    // Reverse the old transaction's effect on account balance
    updateAccountBalances(editingTransaction, true)

    const updatedTransaction: Transaction = {
      ...editingTransaction,
      accountId: newTransaction.accountId,
      type: newTransaction.type,
      amount: Number.parseFloat(newTransaction.amount),
      category: newTransaction.category,
      subcategory: newTransaction.subcategory,
      description: newTransaction.description,
      date: newTransaction.date,
    }

    const updatedTransactions = transactions.map((t) => (t.id === editingTransaction.id ? updatedTransaction : t))

    saveTransactions(updatedTransactions)
    updateAccountBalances(updatedTransaction)

    setEditingTransaction(null)
    setNewTransaction({
      accountId: "",
      toAccountId: "",
      type: "expense",
      amount: "",
      category: "",
      subcategory: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    })
  }

  const handleDeleteTransaction = (transaction: Transaction) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      const updatedTransactions = transactions.filter((t) => t.id !== transaction.id)
      saveTransactions(updatedTransactions)
      updateAccountBalances(transaction, true)
    }
  }

  const openEditDialog = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setNewTransaction({
      accountId: transaction.accountId,
      toAccountId: "",
      type: transaction.type,
      amount: transaction.amount.toString(),
      category: transaction.category,
      subcategory: transaction.subcategory,
      description: transaction.description,
      date: transaction.date,
    })
  }

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case "income":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "expense":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "transfer":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const categories = defaultCategories[newTransaction.type]

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center">
                <Wallet className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold">Money Manager</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-4">
                <Link href="/accounts">
                  <Button variant="ghost">Accounts</Button>
                </Link>
                <Link href="/transactions">
                  <Button variant="ghost" className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    Transactions
                  </Button>
                </Link>
                <Link href="/categories">
                  <Button variant="ghost">Categories</Button>
                </Link>
                <Link href="/goals">
                  <Button variant="ghost">Goals</Button>
                </Link>
                <Link href="/import-export">
                  <Button variant="ghost">Import/Export</Button>
                </Link>
              </div>
              <div className="md:hidden">
                <Select defaultValue="transactions">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="accounts">
                      <Link href="/accounts">Accounts</Link>
                    </SelectItem>
                    <SelectItem value="transactions">Transactions</SelectItem>
                    <SelectItem value="categories">
                      <Link href="/categories">Categories</Link>
                    </SelectItem>
                    <SelectItem value="goals">
                      <Link href="/goals">Goals</Link>
                    </SelectItem>
                    <SelectItem value="import-export">
                      <Link href="/import-export">Import/Export</Link>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Transactions</h1>
            <p className="text-muted-foreground">Track your income, expenses, and transfers</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Transaction</DialogTitle>
                <DialogDescription>Record a new financial transaction.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddTransaction}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">
                      Type
                    </Label>
                    <Select
                      value={newTransaction.type}
                      onValueChange={(value: "income" | "expense" | "transfer") => {
                        setNewTransaction({ ...newTransaction, type: value, category: "", subcategory: "" })
                      }}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                        <SelectItem value="transfer">Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="amount" className="text-right">
                      Amount
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={newTransaction.amount}
                      onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                      className="col-span-3"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="account" className="text-right">
                      Account
                    </Label>
                    <Select
                      value={newTransaction.accountId}
                      onValueChange={(value) => setNewTransaction({ ...newTransaction, accountId: value })}
                      required
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name} (${account.balance.toFixed(2)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">
                      Category
                    </Label>
                    <Select
                      value={newTransaction.category}
                      onValueChange={(value) => {
                        setNewTransaction({ ...newTransaction, category: value, subcategory: "" })
                      }}
                      required
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(categories).map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {newTransaction.category && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="subcategory" className="text-right">
                        Subcategory
                      </Label>
                      <Select
                        value={newTransaction.subcategory}
                        onValueChange={(value) => setNewTransaction({ ...newTransaction, subcategory: value })}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select subcategory" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories[newTransaction.category as keyof typeof categories]?.map((subcat) => (
                            <SelectItem key={subcat} value={subcat}>
                              {subcat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="date" className="text-right">
                      Date
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={newTransaction.date}
                      onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                      className="col-span-3"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={newTransaction.description}
                      onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                      className="col-span-3"
                      placeholder="Optional description"
                      rows={2}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Add Transaction</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="filter-type">Transaction Type</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label htmlFor="filter-account">Account</Label>
                <Select value={filterAccount} onValueChange={setFilterAccount}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Accounts</SelectItem>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle>All Transactions</CardTitle>
            <CardDescription>
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTransactions
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((transaction) => {
                  const account = accounts.find((a) => a.id === transaction.accountId)
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-4 h-4 rounded-full ${
                            transaction.type === "income"
                              ? "bg-green-500"
                              : transaction.type === "expense"
                                ? "bg-red-500"
                                : "bg-blue-500"
                          }`}
                        />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{transaction.description || transaction.category}</p>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getTransactionTypeColor(transaction.type)}`}
                            >
                              {transaction.type}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <span>{account?.name || "Unknown Account"}</span>
                            <span>•</span>
                            <span>{transaction.category}</span>
                            {transaction.subcategory && (
                              <>
                                <span>•</span>
                                <span>{transaction.subcategory}</span>
                              </>
                            )}
                            <span>•</span>
                            <span>{new Date(transaction.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-right mr-4">
                          <p
                            className={`font-medium text-lg ${
                              transaction.type === "income"
                                ? "text-green-600"
                                : transaction.type === "expense"
                                  ? "text-red-600"
                                  : "text-blue-600"
                            }`}
                          >
                            {transaction.type === "expense" ? "-" : ""}${transaction.amount.toFixed(2)}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(transaction)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteTransaction(transaction)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
            </div>

            {filteredTransactions.length === 0 && (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  {transactions.length === 0 ? "No transactions yet" : "No transactions match your filters"}
                </div>
                {transactions.length === 0 && (
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Transaction
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Transaction Dialog */}
        <Dialog open={!!editingTransaction} onOpenChange={() => setEditingTransaction(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Transaction</DialogTitle>
              <DialogDescription>Update your transaction details.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditTransaction}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-type" className="text-right">
                    Type
                  </Label>
                  <Select
                    value={newTransaction.type}
                    onValueChange={(value: "income" | "expense" | "transfer") => {
                      setNewTransaction({ ...newTransaction, type: value, category: "", subcategory: "" })
                    }}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="transfer">Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-amount" className="text-right">
                    Amount
                  </Label>
                  <Input
                    id="edit-amount"
                    type="number"
                    step="0.01"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-account" className="text-right">
                    Account
                  </Label>
                  <Select
                    value={newTransaction.accountId}
                    onValueChange={(value) => setNewTransaction({ ...newTransaction, accountId: value })}
                    required
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name} (${account.balance.toFixed(2)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-category" className="text-right">
                    Category
                  </Label>
                  <Select
                    value={newTransaction.category}
                    onValueChange={(value) => {
                      setNewTransaction({ ...newTransaction, category: value, subcategory: "" })
                    }}
                    required
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(categories).map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {newTransaction.category && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-subcategory" className="text-right">
                      Subcategory
                    </Label>
                    <Select
                      value={newTransaction.subcategory}
                      onValueChange={(value) => setNewTransaction({ ...newTransaction, subcategory: value })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select subcategory" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories[newTransaction.category as keyof typeof categories]?.map((subcat) => (
                          <SelectItem key={subcat} value={subcat}>
                            {subcat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-date" className="text-right">
                    Date
                  </Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="edit-description"
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                    className="col-span-3"
                    rows={2}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Update Transaction</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
