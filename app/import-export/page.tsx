"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Download, Upload, ArrowLeft, Wallet, FileText, Database } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

export default function ImportExportPage() {
  const [exportFormat, setExportFormat] = useState("json")
  const [importData, setImportData] = useState("")
  const [importStatus, setImportStatus] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    const accounts = JSON.parse(localStorage.getItem("money-manager-accounts") || "[]")
    const transactions = JSON.parse(localStorage.getItem("money-manager-transactions") || "[]")
    const categories = JSON.parse(localStorage.getItem("money-manager-categories") || "[]")
    const goals = JSON.parse(localStorage.getItem("money-manager-goals") || "[]")

    if (exportFormat === "json") {
      const data = {
        accounts,
        transactions,
        categories,
        goals,
        exportDate: new Date().toISOString(),
        version: "1.0",
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `money-manager-backup-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } else if (exportFormat === "csv") {
      // Export transactions as CSV
      const csvHeaders = ["Date", "Account", "Type", "Category", "Subcategory", "Description", "Amount"]
      const csvRows = transactions.map((transaction: any) => {
        const account = accounts.find((acc: any) => acc.id === transaction.accountId)
        return [
          transaction.date,
          account?.name || "Unknown",
          transaction.type,
          transaction.category,
          transaction.subcategory || "",
          transaction.description || "",
          transaction.amount,
        ]
      })

      const csvContent = [csvHeaders, ...csvRows].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")

      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `money-manager-transactions-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const handleImport = () => {
    try {
      const data = JSON.parse(importData)

      if (data.accounts) {
        localStorage.setItem("money-manager-accounts", JSON.stringify(data.accounts))
      }
      if (data.transactions) {
        localStorage.setItem("money-manager-transactions", JSON.stringify(data.transactions))
      }
      if (data.categories) {
        localStorage.setItem("money-manager-categories", JSON.stringify(data.categories))
      }
      if (data.goals) {
        localStorage.setItem("money-manager-goals", JSON.stringify(data.goals))
      }

      setImportStatus("Data imported successfully! Please refresh the page to see the changes.")
      setImportData("")
    } catch (error) {
      setImportStatus("Error importing data. Please check the format and try again.")
    }
  }

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setImportData(content)
      }
      reader.readAsText(file)
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
                  <Button variant="ghost">Accounts</Button>
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
                  <Button variant="ghost" className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    Import/Export
                  </Button>
                </Link>
              </div>
              <div className="md:hidden">
                <Select defaultValue="import-export">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="accounts">
                      <Link href="/accounts">Accounts</Link>
                    </SelectItem>
                    <SelectItem value="transactions">
                      <Link href="/transactions">Transactions</Link>
                    </SelectItem>
                    <SelectItem value="categories">
                      <Link href="/categories">Categories</Link>
                    </SelectItem>
                    <SelectItem value="goals">
                      <Link href="/goals">Goals</Link>
                    </SelectItem>
                    <SelectItem value="import-export">Import/Export</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Import & Export</h1>
          <p className="text-muted-foreground">Backup your data or import from other sources</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Export Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Data
              </CardTitle>
              <CardDescription>Download your financial data for backup or analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="export-format">Export Format</Label>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        JSON (Complete Backup)
                      </div>
                    </SelectItem>
                    <SelectItem value="csv">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        CSV (Transactions Only)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="text-sm text-muted-foreground">
                {exportFormat === "json" && (
                  <div>
                    <p className="font-medium mb-2">JSON Export includes:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>All accounts and balances</li>
                      <li>Complete transaction history</li>
                      <li>Custom categories and subcategories</li>
                      <li>Savings goals and progress</li>
                    </ul>
                  </div>
                )}
                {exportFormat === "csv" && (
                  <div>
                    <p className="font-medium mb-2">CSV Export includes:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Transaction history with dates</li>
                      <li>Account names and categories</li>
                      <li>Compatible with Excel and Google Sheets</li>
                    </ul>
                  </div>
                )}
              </div>

              <Button onClick={handleExport} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export {exportFormat.toUpperCase()}
              </Button>
            </CardContent>
          </Card>

          {/* Import Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Import Data
              </CardTitle>
              <CardDescription>Restore from backup or import data from other sources</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="import-file">Import from File</Label>
                <Input
                  id="import-file"
                  type="file"
                  accept=".json,.csv"
                  onChange={handleFileImport}
                  ref={fileInputRef}
                />
              </div>

              <div className="text-center text-muted-foreground">or</div>

              <div>
                <Label htmlFor="import-data">Paste JSON Data</Label>
                <Textarea
                  id="import-data"
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder="Paste your JSON backup data here..."
                  rows={8}
                />
              </div>

              {importStatus && (
                <div
                  className={`p-3 rounded-md text-sm ${
                    importStatus.includes("Error")
                      ? "bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-300"
                      : "bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300"
                  }`}
                >
                  {importStatus}
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-2">Import Notes:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>JSON imports will replace all existing data</li>
                  <li>Make sure to export your current data first</li>
                  <li>Only import data from trusted sources</li>
                </ul>
              </div>

              <Button onClick={handleImport} disabled={!importData} className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Import Data
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Data Summary */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Current Data Summary</CardTitle>
            <CardDescription>Overview of your stored data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {JSON.parse(localStorage.getItem("money-manager-accounts") || "[]").length}
                </div>
                <div className="text-sm text-muted-foreground">Accounts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {JSON.parse(localStorage.getItem("money-manager-transactions") || "[]").length}
                </div>
                <div className="text-sm text-muted-foreground">Transactions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {JSON.parse(localStorage.getItem("money-manager-categories") || "[]").length}
                </div>
                <div className="text-sm text-muted-foreground">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {JSON.parse(localStorage.getItem("money-manager-goals") || "[]").length}
                </div>
                <div className="text-sm text-muted-foreground">Goals</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
