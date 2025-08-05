"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Download, FileText, AlertCircle, CheckCircle } from "lucide-react"

export default function ImportExportPage() {
  const [importFile, setImportFile] = useState<File | null>(null)
  const [exportFormat, setExportFormat] = useState("csv")
  const [exportDateRange, setExportDateRange] = useState("all")
  const [importStatus, setImportStatus] = useState<"idle" | "processing" | "success" | "error">("idle")

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setImportFile(file)
    }
  }

  const handleImport = async () => {
    if (!importFile) return

    setImportStatus("processing")

    // Simulate import process
    setTimeout(() => {
      setImportStatus("success")
      setTimeout(() => setImportStatus("idle"), 3000)
    }, 2000)
  }

  const handleExport = () => {
    // Simulate export process
    const filename = `money-manager-export-${new Date().toISOString().split("T")[0]}.${exportFormat}`

    // Create a mock CSV content
    const csvContent = `Date,Description,Category,Amount,Type,Account
2024-01-15,Grocery shopping,Food,-85.50,Expense,Main Checking
2024-01-15,Monthly salary,Salary,2600.00,Income,Main Checking
2024-01-14,Gas station,Transport,-45.00,Expense,Credit Card`

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Import & Export</h1>
        <p className="text-muted-foreground">Import transactions from other sources or export your data</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Import Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Data
            </CardTitle>
            <CardDescription>Import transactions from CSV files or other financial apps</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="import-file">Select File</Label>
              <Input id="import-file" type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} />
              <p className="text-sm text-muted-foreground">Supported formats: CSV, Excel (.xlsx, .xls)</p>
            </div>

            {importFile && (
              <div className="p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-medium">{importFile.name}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Size: {(importFile.size / 1024).toFixed(1)} KB</p>
              </div>
            )}

            {importStatus === "processing" && (
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                <span className="text-sm">Processing import...</span>
              </div>
            )}

            {importStatus === "success" && (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Import completed successfully!</span>
              </div>
            )}

            {importStatus === "error" && (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Import failed. Please check your file format.</span>
              </div>
            )}

            <Button onClick={handleImport} disabled={!importFile || importStatus === "processing"} className="w-full">
              {importStatus === "processing" ? "Importing..." : "Import Transactions"}
            </Button>

            <div className="space-y-2">
              <h4 className="font-medium">CSV Format Requirements:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Date (YYYY-MM-DD format)</li>
                <li>• Description</li>
                <li>• Category</li>
                <li>• Amount (negative for expenses)</li>
                <li>• Account (optional)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Export Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Data
            </CardTitle>
            <CardDescription>Export your transactions and financial data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="export-format">Export Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Comma Separated)</SelectItem>
                  <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="pdf">PDF Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-range">Date Range</Label>
              <Select value={exportDateRange} onValueChange={setExportDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="current-month">Current Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="current-year">Current Year</SelectItem>
                  <SelectItem value="last-year">Last Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Export Options:</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Include transactions</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Include accounts</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Include categories</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Include goals</span>
                </label>
              </div>
            </div>

            <Button onClick={handleExport} className="w-full">
              Export Data
            </Button>

            <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
              <h4 className="font-medium text-blue-900 dark:text-blue-100">Data Privacy</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Your exported data is processed locally and never sent to external servers.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common import/export tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent">
              <Upload className="h-6 w-6" />
              <div className="text-center">
                <p className="font-medium">Import from Bank</p>
                <p className="text-sm text-muted-foreground">Upload bank statements</p>
              </div>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent">
              <Download className="h-6 w-6" />
              <div className="text-center">
                <p className="font-medium">Monthly Report</p>
                <p className="text-sm text-muted-foreground">Export current month</p>
              </div>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent">
              <FileText className="h-6 w-6" />
              <div className="text-center">
                <p className="font-medium">Tax Report</p>
                <p className="text-sm text-muted-foreground">Generate tax summary</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
