"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, ArrowUpRight, ArrowDownRight, Edit, Trash2 } from 'lucide-react'

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

interface Category {
  id: string
  name: string
  type: "income" | "expense"
  budget: number
  color: string
  subcategories?: string[]
}

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [filterAccount, setFilterAccount] = useState("all")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    type: "expense" as "income" | "expense",
    amount: "",
    accountId: "",
    category: "",
    subcategory: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedTransactions = localStorage.getItem("money-manager-transactions")
        const savedAccounts = localStorage.getItem("money-manager-accounts")
        const savedCategories = localStorage.getItem("money-manager-categories")

        if (savedTransactions) {
          const parsedTransactions = JSON.parse(savedTransactions)
          setTransactions(Array.isArray(parsedTransactions) ? parsedTransactions : [])
        }
        if (savedAccounts) {
          const parsedAccounts = JSON.parse(savedAccounts)
          setAccounts(Array.isArray(parsedAccounts) ? parsedAccounts : [])
        }
        if (savedCategories) {
          const parsedCategories = JSON.parse(savedCategories)
          setCategories(Array.isArray(parsedCategories) ? parsedCategories : [])
        } else {
          // Initialize with default categories only if none exist
          const defaultCategories: Category[] = [
            { id: "1", name: "Food", type: "expense", budget: 500, color: "#8884d8", subcategories: ["Groceries", "Restaurants", "Coffee"] },
            { id: "2", name: "Transportation", type: "expense", budget: 300, color: "#82ca9d", subcategories: ["Gas", "Public Transit", "Parking"] },
            { id: "3", name: "Housing", type: "expense", budget: 1200, color: "#ffc658", subcategories: ["Rent", "Utilities", "Maintenance"] },
            { id: "4", name: "Entertainment", type: "expense", budget: 200, color: "#ff7300", subcategories: ["Movies", "Games", "Subscriptions"] },
            { id: "5", name: "Salary", type: "income", budget: 3000, color: "#00ff00", subcategories: ["Regular Pay", "Overtime", "Bonus"] },
            { id: "6", name: "Other", type: "expense", budget: 100, color: "#0088fe", subcategories: ["Miscellaneous"] },
          ]
          setCategories(defaultCategories)
          localStorage.setItem("money-manager-categories", JSON.stringify(defaultCategories))
        }
      } catch (error) {
        console.error("Error loading data:", error)
        setTransactions([])
        setAccounts([])
        setCategories([])
      }
    }
  }, [])

  const filteredTransactions = Array.isArray(transactions)
    ? transactions.filter((transaction) => {
        if (!transaction) return false

        const description = String(transaction.description || "")
        const category = String(transaction.category || "")
        const searchTermLower = String(searchTerm || "").toLowerCase()

        const matchesSearch =
          description.toLowerCase().includes(searchTermLower) || category.toLowerCase().includes(searchTermLower)

        const matchesCategory =
          filterCategory === "all" || String(transaction.category || "").toLowerCase() === filterCategory.toLowerCase()

        const matchesType = filterType === "all" || transaction.type === filterType

        const matchesAccount = filterAccount === "all" || transaction.accountId === filterAccount

        return matchesSearch && matchesCategory && matchesType && matchesAccount
      })
    : []

  const totalIncome = Array.isArray(transactions)
    ? transactions.filter((t) => t && t.type === "income").reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
    : 0

  const totalExpenses = Array.isArray(transactions)
    ? transactions.filter((t) => t && t.type === "expense").reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
    : 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.amount || !formData.accountId || !formData.category || typeof window === "undefined") return

    try {
      const transaction: Transaction = {
        id: editingTransaction ? editingTransaction.id : Date.now().toString(),
        accountId: formData.accountId,
        type: formData.type,
        amount: Number.parseFloat(formData.amount),
        category: formData.category,
        subcategory: formData.subcategory,
        description: formData.description,
        date: formData.date,
      }

      let updatedTransactions: Transaction[]
      const updatedAccounts = [...accounts]

      if (editingTransaction) {
        // Update existing transaction
        updatedTransactions = transactions.map((t) => (t.id === transaction.id ? transaction : t))

        // Revert old transaction's effect on account balance
        const oldAccount = updatedAccounts.find((a) => a.id === editingTransaction.accountId)
        if (oldAccount) {
          const oldBalanceChange =
            editingTransaction.type === "income" ? -editingTransaction.amount : editingTransaction.amount
          oldAccount.balance += oldBalanceChange
        }
      } else {
        // Add new transaction
        updatedTransactions = [...transactions, transaction]
      }

      // Update account balance
      const account = updatedAccounts.find((a) => a.id === formData.accountId)
      if (account) {
        const balanceChange = formData.type === "income" ? transaction.amount : -transaction.amount
        account.balance += balanceChange
      }

      setTransactions(updatedTransactions)
      setAccounts(updatedAccounts)

      localStorage.setItem("money-manager-transactions", JSON.stringify(updatedTransactions))
      localStorage.setItem("money-manager-accounts", JSON.stringify(updatedAccounts))

      // Reset form
      setFormData({
        type: "expense",
        amount: "",
        accountId: "",
        category: "",
        subcategory: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
      })
      setShowAddDialog(false)
      setEditingTransaction(null)
    } catch (error) {
      console.error("Error saving transaction:", error)
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setFormData({
      type: transaction.type,
      amount: transaction.amount.toString(),
      accountId: transaction.accountId,
      category: transaction.category,
      subcategory: transaction.subcategory,
      description: transaction.description,
      date: transaction.date,
    })
    setShowAddDialog(true)
  }

  const handleDelete = (transaction: Transaction) => {
    if (typeof window === "undefined") return

    try {
      const updatedTransactions = transactions.filter((t) => t.id !== transaction.id)
      const updatedAccounts = [...accounts]

      // Revert transaction's effect on account balance
      const account = updatedAccounts.find((a) => a.id === transaction.accountId)
      if (account) {
        const balanceChange = transaction.type === "income" ? -transaction.amount : transaction.amount
        account.balance += balanceChange
      }

      setTransactions(updatedTransactions)
      setAccounts(updatedAccounts)

      localStorage.setItem("money-manager-transactions", JSON.stringify(updatedTransactions))
      localStorage.setItem("money-manager-accounts", JSON.stringify(updatedAccounts))
    } catch (error) {
      console.error("Error deleting transaction:", error)
    }
  }

  // Get categories for the selected type
  const availableCategories = Array.isArray(categories) 
    ? categories.filter(cat => cat.type === formData.type)
    : []

  // Get subcategories for the selected category
  const selectedCategory = availableCategories.find(cat => cat.name === formData.category)
  const availableSubcategories = selectedCategory?.subcategories || []

  // Get unique categories for filter dropdown
  const uniqueCategories = Array.isArray(categories) 
    ? [...new Set(categories.map(cat => cat.name))]
    : []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">Track and manage all your financial transactions</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingTransaction ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
              <DialogDescription>
                {editingTransaction ? "Update the transaction details." : "Add a new income or expense transaction."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-field">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "income" | "expense") => {
                    setFormData({ ...formData, type: value, category: "", subcategory: "" })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="form-field">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>

              <div className="form-field">
                <Label htmlFor="account">Account</Label>
                <Select
                  value={formData.accountId}
                  onValueChange={(value) => setFormData({ ...formData, accountId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(accounts) &&
                      accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name} (${(account.balance || 0).toFixed(2)})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="form-field">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value, subcategory: "" })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {availableCategories.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    No categories available. <a href="/categories" className="text-blue-600 hover:underline">Create categories</a> first.
                  </p>
                )}
              </div>

              {formData.category && availableSubcategories.length > 0 && (
                <div className="form-field">
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Select
                    value={formData.subcategory}
                    onValueChange={(value) => setFormData({ ...formData, subcategory: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subcategory (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSubcategories.map((subcat) => (
                        <SelectItem key={subcat} value={subcat}>
                          {subcat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="form-field">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div className="form-field">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Add a note about this transaction..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddDialog(false)
                    setEditingTransaction(null)
                    setFormData({
                      type: "expense",
                      amount: "",
                      accountId: "",
                      category: "",
                      subcategory: "",
                      description: "",
                      date: new Date().toISOString().split("T")[0],
                    })
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">{editingTransaction ? "Update" : "Add"} Transaction</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              +${(totalIncome || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              -${(totalExpenses || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Net Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                totalIncome - totalExpenses >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {totalIncome - totalExpenses >= 0 ? "+" : ""}${(totalIncome - totalExpenses).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterAccount} onValueChange={setFilterAccount}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                {Array.isArray(accounts) &&
                  accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map((categoryName) => (
                  <SelectItem key={categoryName} value={categoryName}>
                    {categoryName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            {filteredTransactions.map((transaction) => {
              const account = Array.isArray(accounts) ? accounts.find((a) => a && a.id === transaction.accountId) : null
              return (
                <div key={transaction.id} className="transaction-item">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-2 rounded-full ${
                        transaction.type === "income" ? "bg-green-100 dark:bg-green-900" : "bg-red-100 dark:bg-red-900"
                      }`}
                    >
                      {transaction.type === "income" ? (
                        <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {String(transaction.description || transaction.category || "Unknown")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {String(transaction.category || "Unknown")} • {String(account?.name || "Unknown Account")} •{" "}
                        {String(transaction.date || "Unknown date")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <p className={`text-sm font-semibold transaction-amount ${transaction.type}`}>
                        {transaction.type === "income" ? "+" : "-"}${(Number(transaction.amount) || 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(transaction)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(transaction)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
            {filteredTransactions.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No transactions found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your filters or add a new transaction</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
