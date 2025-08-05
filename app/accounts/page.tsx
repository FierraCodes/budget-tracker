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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, CreditCard, PiggyBank, Wallet, TrendingUp, Edit, Trash2 } from "lucide-react"

interface Account {
  id: string
  name: string
  type: "checking" | "savings" | "credit" | "investment"
  balance: number
  bank: string
  accountNumber: string
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

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    type: "checking" as "checking" | "savings" | "credit" | "investment",
    balance: "",
    bank: "",
    accountNumber: "",
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedAccounts = localStorage.getItem("money-manager-accounts")
        const savedTransactions = localStorage.getItem("money-manager-transactions")

        if (savedAccounts) {
          setAccounts(JSON.parse(savedAccounts))
        }
        if (savedTransactions) {
          setTransactions(JSON.parse(savedTransactions))
        }
      } catch (error) {
        console.error("Error loading data:", error)
      }
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.balance || typeof window === "undefined") return

    try {
      const account: Account = {
        id: editingAccount ? editingAccount.id : Date.now().toString(),
        name: formData.name,
        type: formData.type,
        balance: Number.parseFloat(formData.balance),
        bank: formData.bank,
        accountNumber: formData.accountNumber,
      }

      let updatedAccounts: Account[]
      if (editingAccount) {
        updatedAccounts = accounts.map((a) => (a.id === account.id ? account : a))
      } else {
        updatedAccounts = [...accounts, account]
      }

      setAccounts(updatedAccounts)
      localStorage.setItem("money-manager-accounts", JSON.stringify(updatedAccounts))

      // Reset form
      setFormData({
        name: "",
        type: "checking",
        balance: "",
        bank: "",
        accountNumber: "",
      })
      setShowAddDialog(false)
      setEditingAccount(null)
    } catch (error) {
      console.error("Error saving account:", error)
    }
  }

  const handleEdit = (account: Account) => {
    setEditingAccount(account)
    setFormData({
      name: account.name,
      type: account.type,
      balance: account.balance.toString(),
      bank: account.bank,
      accountNumber: account.accountNumber,
    })
    setShowAddDialog(true)
  }

  const handleDelete = (accountId: string) => {
    if (typeof window === "undefined") return

    // Check if account has transactions
    const hasTransactions = transactions.some((t) => t.accountId === accountId)
    if (hasTransactions) {
      alert("Cannot delete account with existing transactions. Please delete or move transactions first.")
      return
    }

    try {
      const updatedAccounts = accounts.filter((a) => a.id !== accountId)
      setAccounts(updatedAccounts)
      localStorage.setItem("money-manager-accounts", JSON.stringify(updatedAccounts))
    } catch (error) {
      console.error("Error deleting account:", error)
    }
  }

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "checking":
        return Wallet
      case "savings":
        return PiggyBank
      case "credit":
        return CreditCard
      case "investment":
        return TrendingUp
      default:
        return Wallet
    }
  }

  const getBalanceColor = (balance: number, type: string) => {
    if (type === "credit") {
      return balance < 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
    }
    return balance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
  }

  const totalAssets = accounts
    .filter((a) => a.type !== "credit")
    .reduce((sum, account) => sum + Math.max(0, account.balance), 0)

  const totalLiabilities = accounts
    .filter((a) => a.type === "credit")
    .reduce((sum, account) => sum + Math.max(0, -account.balance), 0)

  const netWorth = totalAssets - totalLiabilities

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Accounts</h1>
          <p className="text-muted-foreground">Manage your bank accounts and credit cards</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingAccount ? "Edit Account" : "Add Account"}</DialogTitle>
              <DialogDescription>
                {editingAccount ? "Update your account details." : "Add a new bank account or credit card."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-field">
                <Label htmlFor="name">Account Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Main Checking, Savings"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-field">
                <Label htmlFor="type">Account Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "checking" | "savings" | "credit" | "investment") =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Checking</SelectItem>
                    <SelectItem value="savings">Savings</SelectItem>
                    <SelectItem value="credit">Credit Card</SelectItem>
                    <SelectItem value="investment">Investment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="form-field">
                <Label htmlFor="balance">
                  {formData.type === "credit" ? "Current Balance (negative for debt)" : "Current Balance"}
                </Label>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                  required
                />
              </div>

              <div className="form-field">
                <Label htmlFor="bank">Bank/Institution</Label>
                <Input
                  id="bank"
                  placeholder="e.g., Chase Bank, Wells Fargo"
                  value={formData.bank}
                  onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                />
              </div>

              <div className="form-field">
                <Label htmlFor="accountNumber">Account Number (last 4 digits)</Label>
                <Input
                  id="accountNumber"
                  placeholder="****1234"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddDialog(false)
                    setEditingAccount(null)
                    setFormData({
                      name: "",
                      type: "checking",
                      balance: "",
                      bank: "",
                      accountNumber: "",
                    })
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">{editingAccount ? "Update" : "Add"} Account</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Account Summary */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">${totalAssets.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Liabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              ${totalLiabilities.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${netWorth >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
            >
              ${netWorth.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accounts List */}
      {accounts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => {
            const IconComponent = getAccountIcon(account.type)
            const accountTransactions = transactions.filter((t) => t.accountId === account.id)

            return (
              <Card key={account.id} className="account-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center space-x-2">
                    <IconComponent className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-lg">{account.name}</CardTitle>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(account)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(account.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{account.bank}</p>
                    <p className="text-sm text-muted-foreground">{account.accountNumber}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {account.type === "credit" ? "Balance" : "Current Balance"}
                    </p>
                    <p className={`text-2xl font-bold ${getBalanceColor(account.balance, account.type)}`}>
                      ${account.balance.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      {accountTransactions.length} transaction{accountTransactions.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Wallet className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No accounts yet</h3>
            <p className="text-muted-foreground mb-4">Add your first account to start tracking your finances.</p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Account
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recent Account Activity */}
      {transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Account Activity</CardTitle>
            <CardDescription>Latest transactions across all accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 10)
                .map((transaction) => {
                  const account = accounts.find((a) => a.id === transaction.accountId)
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{transaction.description || transaction.category}</p>
                        <p className="text-sm text-muted-foreground">
                          {account?.name || "Unknown Account"} • {transaction.date}
                        </p>
                      </div>
                      <p
                        className={`font-semibold ${
                          transaction.type === "income"
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}${transaction.amount.toFixed(2)}
                      </p>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
