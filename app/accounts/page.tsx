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
import { Plus, Edit, Trash2, ArrowLeft, Wallet } from "lucide-react"
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

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [newAccount, setNewAccount] = useState({
    name: "",
    balance: "",
    type: "checking" as const,
  })

  useEffect(() => {
    const savedAccounts = localStorage.getItem("money-manager-accounts")
    const savedTransactions = localStorage.getItem("money-manager-transactions")
    if (savedAccounts) setAccounts(JSON.parse(savedAccounts))
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions))
  }, [])

  const saveAccounts = (updatedAccounts: Account[]) => {
    setAccounts(updatedAccounts)
    localStorage.setItem("money-manager-accounts", JSON.stringify(updatedAccounts))
  }

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAccount.name || !newAccount.balance) return

    const account: Account = {
      id: Date.now().toString(),
      name: newAccount.name,
      balance: Number.parseFloat(newAccount.balance),
      type: newAccount.type,
    }

    saveAccounts([...accounts, account])
    setNewAccount({ name: "", balance: "", type: "checking" })
    setIsAddDialogOpen(false)
  }

  const handleEditAccount = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAccount || !newAccount.name || !newAccount.balance) return

    const updatedAccounts = accounts.map((account) =>
      account.id === editingAccount.id
        ? {
            ...account,
            name: newAccount.name,
            balance: Number.parseFloat(newAccount.balance),
            type: newAccount.type,
          }
        : account,
    )

    saveAccounts(updatedAccounts)
    setEditingAccount(null)
    setNewAccount({ name: "", balance: "", type: "checking" })
  }

  const handleDeleteAccount = (accountId: string) => {
    if (confirm("Are you sure you want to delete this account? This action cannot be undone.")) {
      const updatedAccounts = accounts.filter((account) => account.id !== accountId)
      saveAccounts(updatedAccounts)

      // Also remove transactions for this account
      const updatedTransactions = transactions.filter((transaction) => transaction.accountId !== accountId)
      setTransactions(updatedTransactions)
      localStorage.setItem("money-manager-transactions", JSON.stringify(updatedTransactions))
    }
  }

  const openEditDialog = (account: Account) => {
    setEditingAccount(account)
    setNewAccount({
      name: account.name,
      balance: account.balance.toString(),
      type: account.type,
    })
  }

  const getAccountTransactions = (accountId: string) => {
    return transactions.filter((transaction) => transaction.accountId === accountId)
  }

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case "checking":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "savings":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "credit":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "investment":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

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
                  <Button variant="ghost" className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    Accounts
                  </Button>
                </Link>
                <Link href="/transactions">
                  <Button variant="ghost">Transactions</Button>
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
                <Select defaultValue="accounts">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="accounts">Accounts</SelectItem>
                    <SelectItem value="transactions">
                      <Link href="/transactions">Transactions</Link>
                    </SelectItem>
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
            <h1 className="text-3xl font-bold">Accounts</h1>
            <p className="text-muted-foreground">Manage your financial accounts</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Account</DialogTitle>
                <DialogDescription>Create a new financial account to track your money.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddAccount}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={newAccount.name}
                      onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                      className="col-span-3"
                      placeholder="Account name"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="balance" className="text-right">
                      Balance
                    </Label>
                    <Input
                      id="balance"
                      type="number"
                      step="0.01"
                      value={newAccount.balance}
                      onChange={(e) => setNewAccount({ ...newAccount, balance: e.target.value })}
                      className="col-span-3"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">
                      Type
                    </Label>
                    <Select
                      value={newAccount.type}
                      onValueChange={(value: "checking" | "savings" | "credit" | "investment") =>
                        setNewAccount({ ...newAccount, type: value })
                      }
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checking">Checking</SelectItem>
                        <SelectItem value="savings">Savings</SelectItem>
                        <SelectItem value="credit">Credit</SelectItem>
                        <SelectItem value="investment">Investment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Add Account</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => {
            const accountTransactions = getAccountTransactions(account.id)
            const recentTransactions = accountTransactions
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 3)

            return (
              <Card key={account.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {account.name}
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getAccountTypeColor(account.type)}`}
                        >
                          {account.type}
                        </span>
                      </CardTitle>
                      <CardDescription className="text-2xl font-bold mt-2">
                        ${account.balance.toFixed(2)}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(account)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteAccount(account.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Transactions</span>
                      <span className="font-medium">{accountTransactions.length}</span>
                    </div>
                    {recentTransactions.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Recent Activity</h4>
                        <div className="space-y-2">
                          {recentTransactions.map((transaction) => (
                            <div key={transaction.id} className="flex justify-between items-center text-sm">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    transaction.type === "income"
                                      ? "bg-green-500"
                                      : transaction.type === "expense"
                                        ? "bg-red-500"
                                        : "bg-blue-500"
                                  }`}
                                />
                                <span className="truncate max-w-[120px]">
                                  {transaction.description || transaction.category}
                                </span>
                              </div>
                              <span
                                className={`font-medium ${
                                  transaction.type === "income"
                                    ? "text-green-600"
                                    : transaction.type === "expense"
                                      ? "text-red-600"
                                      : "text-blue-600"
                                }`}
                              >
                                {transaction.type === "expense" ? "-" : ""}${transaction.amount.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {accounts.length === 0 && (
          <div className="text-center py-12">
            <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No accounts yet</h3>
            <p className="text-muted-foreground mb-4">Get started by adding your first financial account.</p>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Account
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        )}

        {/* Edit Account Dialog */}
        <Dialog open={!!editingAccount} onOpenChange={() => setEditingAccount(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Account</DialogTitle>
              <DialogDescription>Update your account information.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditAccount}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="edit-name"
                    value={newAccount.name}
                    onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-balance" className="text-right">
                    Balance
                  </Label>
                  <Input
                    id="edit-balance"
                    type="number"
                    step="0.01"
                    value={newAccount.balance}
                    onChange={(e) => setNewAccount({ ...newAccount, balance: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-type" className="text-right">
                    Type
                  </Label>
                  <Select
                    value={newAccount.type}
                    onValueChange={(value: "checking" | "savings" | "credit" | "investment") =>
                      setNewAccount({ ...newAccount, type: value })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checking">Checking</SelectItem>
                      <SelectItem value="savings">Savings</SelectItem>
                      <SelectItem value="credit">Credit</SelectItem>
                      <SelectItem value="investment">Investment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Update Account</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
