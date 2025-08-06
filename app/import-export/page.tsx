"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Download, FileText, AlertCircle, CheckCircle, Database, FileImage } from 'lucide-react'

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

interface Account {
  id: string
  name: string
  balance: number
  type: "checking" | "savings" | "credit" | "investment"
  bank: string
  accountNumber: string
}

interface Category {
  id: string
  name: string
  type: "income" | "expense"
  budget: number
  color: string
  subcategories?: string[]
}

interface SavingsGoal {
  id: string
  name: string
  description: string
  targetAmount: number
  currentAmount: number
  targetDate: string
  category: string
  priority: "High" | "Medium" | "Low"
  linkedAccountId?: string
  trackingMode: "manual" | "account"
}

export default function ImportExportPage() {
  const [importFile, setImportFile] = useState<File | null>(null)
  const [exportFormat, setExportFormat] = useState("csv")
  const [exportDateRange, setExportDateRange] = useState("all")
  const [exportDataType, setExportDataType] = useState("all")
  const [importStatus, setImportStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [importError, setImportError] = useState("")

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setImportFile(file)
      setImportStatus("idle")
      setImportError("")
    }
  }

  const parseCSV = (csvText: string) => {
    const lines = csvText.split('\n').filter(line => line.trim())
    if (lines.length < 2) throw new Error("CSV must have at least a header and one data row")
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const transactions: any[] = []
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      if (values.length !== headers.length) continue
      
      const transaction: any = {}
      headers.forEach((header, index) => {
        transaction[header] = values[index]
      })
      
      // Validate required fields
      if (!transaction.date || !transaction.description || !transaction.amount) continue
      
      // Convert to our format
      const amount = Math.abs(parseFloat(transaction.amount) || 0)
      const isExpense = parseFloat(transaction.amount) < 0 || transaction.type?.toLowerCase() === 'expense'
      
      transactions.push({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        accountId: "1", // Default to first account
        type: isExpense ? "expense" : "income",
        amount: amount,
        category: transaction.category || "Other",
        subcategory: transaction.subcategory || "",
        description: transaction.description,
        date: new Date(transaction.date).toISOString().split('T')[0]
      })
    }
    
    return transactions
  }

const parseSQL = (sqlText: string) => {
  const transactions: Transaction[] = []
  const accounts: Account[] = []
  const categories: Category[] = []
  const goals: SavingsGoal[] = []

  // Split SQL into lines and process INSERT statements
  const lines = sqlText.split('\n')
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // Look for INSERT INTO statements
    if (line.startsWith('INSERT INTO ')) {
      try {
        // Extract table name
        const tableMatch = line.match(/INSERT INTO (\w+) VALUES/)
        if (!tableMatch) continue
        
        const tableName = tableMatch[1]
        
        // Extract values - look for content between parentheses
        const valuesMatch = line.match(/VALUES $$(.*)$$;?$/)
        if (!valuesMatch) continue
        
        const valuesStr = valuesMatch[1]
        
        // Parse values with proper quote handling
        const values = parseCSVLine(valuesStr)
        
        // Map to appropriate data structure based on table
        switch (tableName) {
          case 'transactions':
            if (values.length >= 8) {
              transactions.push({
                id: values[0] || Date.now().toString() + Math.random().toString(36).substr(2, 9),
                accountId: values[1] || "1",
                type: (values[2] || "expense") as "income" | "expense" | "transfer",
                amount: parseFloat(values[3]) || 0,
                category: values[4] || "",
                subcategory: values[5] || "",
                description: values[6] || "",
                date: values[7] || new Date().toISOString().split('T')[0]
              })
            }
            break
            
          case 'accounts':
            if (values.length >= 6) {
              accounts.push({
                id: values[0] || Date.now().toString() + Math.random().toString(36).substr(2, 9),
                name: values[1] || "Unknown Account",
                type: (values[2] || "checking") as "checking" | "savings" | "credit" | "investment",
                balance: parseFloat(values[3]) || 0,
                bank: values[4] || "",
                accountNumber: values[5] || ""
              })
            }
            break
            
          case 'categories':
            if (values.length >= 6) {
              let subcategories: string[] = []
              try {
                if (values[5] && values[5] !== 'NULL') {
                  subcategories = JSON.parse(values[5])
                }
              } catch {
                subcategories = []
              }
              
              categories.push({
                id: values[0] || Date.now().toString() + Math.random().toString(36).substr(2, 9),
                name: values[1] || "Unknown Category",
                type: (values[2] || "expense") as "income" | "expense",
                budget: parseFloat(values[3]) || 0,
                color: values[4] || "#8884d8",
                subcategories
              })
            }
            break
            
          case 'goals':
            if (values.length >= 10) {
              goals.push({
                id: values[0] || Date.now().toString() + Math.random().toString(36).substr(2, 9),
                name: values[1] || "Unknown Goal",
                description: values[2] || "",
                targetAmount: parseFloat(values[3]) || 0,
                currentAmount: parseFloat(values[4]) || 0,
                targetDate: values[5] || new Date().toISOString().split('T')[0],
                category: values[6] || "",
                priority: (values[7] || "Medium") as "High" | "Medium" | "Low",
                linkedAccountId: values[8] === 'NULL' || !values[8] ? undefined : values[8],
                trackingMode: (values[9] || "manual") as "manual" | "account"
              })
            }
            break
        }
      } catch (error) {
        console.warn(`Error parsing SQL line: ${line}`, error)
        continue
      }
    }
  }

  return { transactions, accounts, categories, goals }
}

// Helper function to parse CSV-like values with proper quote handling
const parseCSVLine = (line: string): string[] => {
  const values: string[] = []
  let current = ''
  let inQuotes = false
  let i = 0
  
  while (i < line.length) {
    const char = line[i]
    const nextChar = line[i + 1]
    
    if (char === "'" && !inQuotes) {
      // Start of quoted string
      inQuotes = true
    } else if (char === "'" && inQuotes) {
      // Check if it's an escaped quote
      if (nextChar === "'") {
        // Escaped quote - add single quote to current value
        current += "'"
        i++ // Skip the next quote
      } else {
        // End of quoted string
        inQuotes = false
      }
    } else if (char === ',' && !inQuotes) {
      // End of value
      values.push(current.trim())
      current = ''
    } else if (!inQuotes && (char === ' ' || char === '\t')) {
      // Skip whitespace outside quotes
    } else {
      // Regular character
      current += char
    }
    
    i++
  }
  
  // Add the last value
  if (current.trim() || values.length > 0) {
    values.push(current.trim())
  }
  
  return values
}

  const handleImport = async () => {
  if (!importFile) return

  setImportStatus("processing")
  setImportError("")

  try {
    const text = await importFile.text()
    let importedData: any = {}

    if (importFile.name.endsWith('.csv')) {
      importedData.transactions = parseCSV(text)
    } else if (importFile.name.endsWith('.json')) {
      const data = JSON.parse(text)
      importedData = Array.isArray(data) ? { transactions: data } : data
    } else if (importFile.name.endsWith('.sql')) {
      importedData = parseSQL(text)
      console.log('Parsed SQL data:', importedData) // Debug log
    } else {
      throw new Error("Unsupported file format. Please use .csv, .json, or .sql files.")
    }

    // Get existing data
    const existingTransactions = JSON.parse(localStorage.getItem("money-manager-transactions") || "[]")
    const existingAccounts = JSON.parse(localStorage.getItem("money-manager-accounts") || "[]")
    const existingCategories = JSON.parse(localStorage.getItem("money-manager-categories") || "[]")
    const existingGoals = JSON.parse(localStorage.getItem("money-manager-goals") || "[]")

    let importCount = 0
    let importSummary: string[] = []

    // Import transactions
    if (importedData.transactions && Array.isArray(importedData.transactions) && importedData.transactions.length > 0) {
      const allTransactions = [...existingTransactions, ...importedData.transactions]
      localStorage.setItem("money-manager-transactions", JSON.stringify(allTransactions))
      importCount += importedData.transactions.length
      importSummary.push(`${importedData.transactions.length} transactions`)

      // Update account balances for transactions
      if (existingAccounts.length > 0) {
        const updatedAccounts = existingAccounts.map((account: Account) => {
          const accountTransactions = importedData.transactions.filter((t: Transaction) => t.accountId === account.id)
          const balanceChange = accountTransactions.reduce((sum: number, t: Transaction) => {
            return sum + (t.type === "income" ? t.amount : -t.amount)
          }, 0)
          
          return { ...account, balance: account.balance + balanceChange }
        })
        localStorage.setItem("money-manager-accounts", JSON.stringify(updatedAccounts))
      }
    }

    // Import accounts
    if (importedData.accounts && Array.isArray(importedData.accounts) && importedData.accounts.length > 0) {
      const allAccounts = [...existingAccounts, ...importedData.accounts]
      localStorage.setItem("money-manager-accounts", JSON.stringify(allAccounts))
      importCount += importedData.accounts.length
      importSummary.push(`${importedData.accounts.length} accounts`)
    }

    // Import categories
    if (importedData.categories && Array.isArray(importedData.categories) && importedData.categories.length > 0) {
      const allCategories = [...existingCategories, ...importedData.categories]
      localStorage.setItem("money-manager-categories", JSON.stringify(allCategories))
      importCount += importedData.categories.length
      importSummary.push(`${importedData.categories.length} categories`)
    }

    // Import goals
    if (importedData.goals && Array.isArray(importedData.goals) && importedData.goals.length > 0) {
      const allGoals = [...existingGoals, ...importedData.goals]
      localStorage.setItem("money-manager-goals", JSON.stringify(allGoals))
      importCount += importedData.goals.length
      importSummary.push(`${importedData.goals.length} goals`)
    }

    if (importCount === 0) {
      throw new Error(`No valid data found in file. Expected transactions, accounts, categories, or goals data. File type: ${importFile.name.split('.').pop()?.toUpperCase()}`)
    }

    setImportStatus("success")
    console.log(`Successfully imported: ${importSummary.join(', ')}`)
    setTimeout(() => setImportStatus("idle"), 3000)
  } catch (error) {
    console.error("Import error:", error)
    setImportError(error instanceof Error ? error.message : "Import failed")
    setImportStatus("error")
    setTimeout(() => setImportStatus("idle"), 5000)
  }
}

  // Create SQL dump
  const createSQLDump = (data: any, dataType: string): string => {
    let sql = "-- Money Manager SQLite Database Export\n"
    sql += `-- Generated on: ${new Date().toISOString()}\n`
    sql += `-- Data Type: ${dataType}\n\n`

    // Create tables based on data type
    if (dataType === "all" || dataType === "accounts") {
      sql += `-- Accounts Table\n`
      sql += `CREATE TABLE IF NOT EXISTS accounts (\n`
      sql += `  id TEXT PRIMARY KEY,\n`
      sql += `  name TEXT NOT NULL,\n`
      sql += `  type TEXT NOT NULL,\n`
      sql += `  balance REAL NOT NULL,\n`
      sql += `  bank TEXT,\n`
      sql += `  account_number TEXT\n`
      sql += `);\n\n`

      const accounts = dataType === "all" ? data.accounts : data
      if (Array.isArray(accounts)) {
        accounts.forEach((account: Account) => {
          sql += `INSERT INTO accounts VALUES ('${account.id}', '${account.name.replace(/'/g, "''")}', '${account.type}', ${account.balance}, '${(account.bank || '').replace(/'/g, "''")}', '${(account.accountNumber || '').replace(/'/g, "''")}');\n`
        })
        sql += "\n"
      }
    }

    if (dataType === "all" || dataType === "transactions") {
      sql += `-- Transactions Table\n`
      sql += `CREATE TABLE IF NOT EXISTS transactions (\n`
      sql += `  id TEXT PRIMARY KEY,\n`
      sql += `  account_id TEXT,\n`
      sql += `  type TEXT NOT NULL,\n`
      sql += `  amount REAL NOT NULL,\n`
      sql += `  category TEXT,\n`
      sql += `  subcategory TEXT,\n`
      sql += `  description TEXT,\n`
      sql += `  date TEXT NOT NULL,\n`
      sql += `  FOREIGN KEY (account_id) REFERENCES accounts (id)\n`
      sql += `);\n\n`

      const transactions = dataType === "all" ? data.transactions : data
      if (Array.isArray(transactions)) {
        transactions.forEach((transaction: Transaction) => {
          sql += `INSERT INTO transactions VALUES ('${transaction.id}', '${transaction.accountId}', '${transaction.type}', ${transaction.amount}, '${(transaction.category || '').replace(/'/g, "''")}', '${(transaction.subcategory || '').replace(/'/g, "''")}', '${(transaction.description || '').replace(/'/g, "''")}', '${transaction.date}');\n`
        })
        sql += "\n"
      }
    }

    if (dataType === "all" || dataType === "categories") {
      sql += `-- Categories Table\n`
      sql += `CREATE TABLE IF NOT EXISTS categories (\n`
      sql += `  id TEXT PRIMARY KEY,\n`
      sql += `  name TEXT NOT NULL,\n`
      sql += `  type TEXT NOT NULL,\n`
      sql += `  budget REAL NOT NULL,\n`
      sql += `  color TEXT,\n`
      sql += `  subcategories TEXT\n`
      sql += `);\n\n`

      const categories = dataType === "all" ? data.categories : data
      if (Array.isArray(categories)) {
        categories.forEach((category: Category) => {
          const subcategoriesJson = JSON.stringify(category.subcategories || []).replace(/'/g, "''")
          sql += `INSERT INTO categories VALUES ('${category.id}', '${category.name.replace(/'/g, "''")}', '${category.type}', ${category.budget}, '${category.color || ''}', '${subcategoriesJson}');\n`
        })
        sql += "\n"
      }
    }

    if (dataType === "all" || dataType === "goals") {
      sql += `-- Goals Table\n`
      sql += `CREATE TABLE IF NOT EXISTS goals (\n`
      sql += `  id TEXT PRIMARY KEY,\n`
      sql += `  name TEXT NOT NULL,\n`
      sql += `  description TEXT,\n`
      sql += `  target_amount REAL NOT NULL,\n`
      sql += `  current_amount REAL NOT NULL,\n`
      sql += `  target_date TEXT NOT NULL,\n`
      sql += `  category TEXT,\n`
      sql += `  priority TEXT,\n`
      sql += `  linked_account_id TEXT,\n`
      sql += `  tracking_mode TEXT,\n`
      sql += `  FOREIGN KEY (linked_account_id) REFERENCES accounts (id)\n`
      sql += `);\n\n`

      const goals = dataType === "all" ? data.goals : data
      if (Array.isArray(goals)) {
        goals.forEach((goal: SavingsGoal) => {
          sql += `INSERT INTO goals VALUES ('${goal.id}', '${goal.name.replace(/'/g, "''")}', '${(goal.description || '').replace(/'/g, "''")}', ${goal.targetAmount}, ${goal.currentAmount}, '${goal.targetDate}', '${(goal.category || '').replace(/'/g, "''")}', '${goal.priority}', ${goal.linkedAccountId ? `'${goal.linkedAccountId}'` : 'NULL'}, '${goal.trackingMode || 'manual'}');\n`
        })
        sql += "\n"
      }
    }

    // Add metadata
    sql += `-- Export Metadata\n`
    sql += `CREATE TABLE IF NOT EXISTS export_metadata (\n`
    sql += `  export_date TEXT,\n`
    sql += `  version TEXT,\n`
    sql += `  data_type TEXT,\n`
    sql += `  record_count INTEGER\n`
    sql += `);\n\n`

    const recordCount = Array.isArray(data) ? data.length : 
      (data.transactions?.length || 0) + (data.accounts?.length || 0) + 
      (data.categories?.length || 0) + (data.goals?.length || 0)

    sql += `INSERT INTO export_metadata VALUES ('${new Date().toISOString()}', '1.0', '${dataType}', ${recordCount});\n`

    return sql
  }

  // Create Excel-compatible CSV
  const createExcelCSV = (data: any, dataType: string): string => {
    if (dataType === "transactions" || dataType === "all") {
      const transactions = dataType === "all" ? data.transactions : data
      const accounts = dataType === "all" ? data.accounts : JSON.parse(localStorage.getItem("money-manager-accounts") || "[]")
      
      let csv = "Date,Description,Category,Subcategory,Amount,Type,Account,Balance Impact\n"
      
      if (Array.isArray(transactions)) {
        transactions.forEach((t: Transaction) => {
          const account = accounts.find((a: Account) => a.id === t.accountId)
          const balanceImpact = t.type === 'expense' ? -t.amount : t.amount
          csv += `"${t.date}","${(t.description || '').replace(/"/g, '""')}","${(t.category || '').replace(/"/g, '""')}","${(t.subcategory || '').replace(/"/g, '""')}",${t.amount},"${t.type}","${(account?.name || 'Unknown').replace(/"/g, '""')}",${balanceImpact}\n`
        })
      }
      
      return csv
    } else if (dataType === "accounts") {
      const accounts = Array.isArray(data) ? data : [data]
      let csv = "Account Name,Type,Balance,Bank,Account Number\n"
      
      accounts.forEach((a: Account) => {
        csv += `"${a.name.replace(/"/g, '""')}","${a.type}",${a.balance},"${(a.bank || '').replace(/"/g, '""')}","${(a.accountNumber || '').replace(/"/g, '""')}"\n`
      })
      
      return csv
    } else if (dataType === "categories") {
      const categories = Array.isArray(data) ? data : [data]
      let csv = "Category Name,Type,Budget,Color,Subcategories\n"
      
      categories.forEach((c: Category) => {
        const subcats = (c.subcategories || []).join('; ')
        csv += `"${c.name.replace(/"/g, '""')}","${c.type}",${c.budget},"${c.color || ''}","${subcats.replace(/"/g, '""')}"\n`
      })
      
      return csv
    } else if (dataType === "goals") {
      const goals = Array.isArray(data) ? data : [data]
      let csv = "Goal Name,Description,Target Amount,Current Amount,Target Date,Category,Priority,Tracking Mode\n"
      
      goals.forEach((g: SavingsGoal) => {
        csv += `"${g.name.replace(/"/g, '""')}","${(g.description || '').replace(/"/g, '""')}",${g.targetAmount},${g.currentAmount},"${g.targetDate}","${(g.category || '').replace(/"/g, '""')}","${g.priority}","${g.trackingMode || 'manual'}"\n`
      })
      
      return csv
    }
    
    return ""
  }

  // Create PDF report
  const createPDFReport = (data: any, dataType: string): string => {
    const now = new Date()
    const dateStr = now.toLocaleDateString()
    const timeStr = now.toLocaleTimeString()

    let html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Money Manager Report - ${dateStr}</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 40px; 
            color: #333; 
            line-height: 1.6;
        }
        .header { 
            text-align: center; 
            border-bottom: 2px solid #333; 
            padding-bottom: 20px; 
            margin-bottom: 30px; 
        }
        .header h1 { 
            color: #2563eb; 
            margin: 0; 
            font-size: 28px; 
        }
        .header p { 
            margin: 5px 0; 
            color: #666; 
        }
        .section { 
            margin-bottom: 30px; 
        }
        .section h2 { 
            color: #1f2937; 
            border-bottom: 1px solid #e5e7eb; 
            padding-bottom: 10px; 
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 15px; 
        }
        th, td { 
            border: 1px solid #d1d5db; 
            padding: 12px; 
            text-align: left; 
        }
        th { 
            background-color: #f3f4f6; 
            font-weight: bold; 
        }
        .amount-positive { color: #059669; font-weight: bold; }
        .amount-negative { color: #dc2626; font-weight: bold; }
        .summary-card { 
            background: #f8fafc; 
            border: 1px solid #e2e8f0; 
            border-radius: 8px; 
            padding: 20px; 
            margin: 15px 0; 
        }
        .summary-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 20px; 
        }
        .summary-item { 
            text-align: center; 
        }
        .summary-value { 
            font-size: 24px; 
            font-weight: bold; 
            color: #2563eb; 
        }
        .summary-label { 
            color: #6b7280; 
            font-size: 14px; 
        }
        .footer { 
            margin-top: 50px; 
            text-align: center; 
            color: #6b7280; 
            font-size: 12px; 
            border-top: 1px solid #e5e7eb; 
            padding-top: 20px; 
        }
        @media print {
            body { margin: 20px; }
            .section { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>💰 Money Manager Financial Report</h1>
        <p>Generated on ${dateStr} at ${timeStr}</p>
        <p>Report Type: ${dataType === 'all' ? 'Complete Financial Overview' : dataType.charAt(0).toUpperCase() + dataType.slice(1)} Report</p>
    </div>
`

    if (dataType === "all" || dataType === "transactions") {
      const transactions = dataType === "all" ? data.transactions : data
      const accounts = dataType === "all" ? data.accounts : JSON.parse(localStorage.getItem("money-manager-accounts") || "[]")
      
      if (Array.isArray(transactions) && transactions.length > 0) {
        const totalIncome = transactions.filter((t: Transaction) => t.type === 'income').reduce((sum: number, t: Transaction) => sum + t.amount, 0)
        const totalExpenses = transactions.filter((t: Transaction) => t.type === 'expense').reduce((sum: number, t: Transaction) => sum + t.amount, 0)
        const netFlow = totalIncome - totalExpenses

        html += `
    <div class="section">
        <h2>📊 Transaction Summary</h2>
        <div class="summary-card">
            <div class="summary-grid">
                <div class="summary-item">
                    <div class="summary-value amount-positive">$${totalIncome.toLocaleString()}</div>
                    <div class="summary-label">Total Income</div>
                </div>
                <div class="summary-item">
                    <div class="summary-value amount-negative">$${totalExpenses.toLocaleString()}</div>
                    <div class="summary-label">Total Expenses</div>
                </div>
                <div class="summary-item">
                    <div class="summary-value ${netFlow >= 0 ? 'amount-positive' : 'amount-negative'}">$${netFlow.toLocaleString()}</div>
                    <div class="summary-label">Net Flow</div>
                </div>
                <div class="summary-item">
                    <div class="summary-value">${transactions.length}</div>
                    <div class="summary-label">Total Transactions</div>
                </div>
            </div>
        </div>
        
        <h3>Recent Transactions</h3>
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Account</th>
                    <th>Amount</th>
                    <th>Type</th>
                </tr>
            </thead>
            <tbody>
`
        
        transactions.slice(0, 50).forEach((t: Transaction) => {
          const account = accounts.find((a: Account) => a.id === t.accountId)
          const amountClass = t.type === 'income' ? 'amount-positive' : 'amount-negative'
          const amountPrefix = t.type === 'income' ? '+' : '-'
          
          html += `
                <tr>
                    <td>${t.date}</td>
                    <td>${t.description || 'N/A'}</td>
                    <td>${t.category || 'N/A'}</td>
                    <td>${account?.name || 'Unknown'}</td>
                    <td class="${amountClass}">${amountPrefix}$${t.amount.toFixed(2)}</td>
                    <td>${t.type.charAt(0).toUpperCase() + t.type.slice(1)}</td>
                </tr>
`
        })
        
        html += `
            </tbody>
        </table>
    </div>
`
      }
    }

    if (dataType === "all" || dataType === "accounts") {
      const accounts = dataType === "all" ? data.accounts : data
      
      if (Array.isArray(accounts) && accounts.length > 0) {
        const totalAssets = accounts.filter((a: Account) => a.type !== 'credit').reduce((sum: number, a: Account) => sum + Math.max(0, a.balance), 0)
        const totalLiabilities = accounts.filter((a: Account) => a.type === 'credit').reduce((sum: number, a: Account) => sum + Math.max(0, -a.balance), 0)
        const netWorth = totalAssets - totalLiabilities

        html += `
    <div class="section">
        <h2>🏦 Account Overview</h2>
        <div class="summary-card">
            <div class="summary-grid">
                <div class="summary-item">
                    <div class="summary-value amount-positive">$${totalAssets.toLocaleString()}</div>
                    <div class="summary-label">Total Assets</div>
                </div>
                <div class="summary-item">
                    <div class="summary-value amount-negative">$${totalLiabilities.toLocaleString()}</div>
                    <div class="summary-label">Total Liabilities</div>
                </div>
                <div class="summary-item">
                    <div class="summary-value ${netWorth >= 0 ? 'amount-positive' : 'amount-negative'}">$${netWorth.toLocaleString()}</div>
                    <div class="summary-label">Net Worth</div>
                </div>
                <div class="summary-item">
                    <div class="summary-value">${accounts.length}</div>
                    <div class="summary-label">Total Accounts</div>
                </div>
            </div>
        </div>
        
        <table>
            <thead>
                <tr>
                    <th>Account Name</th>
                    <th>Type</th>
                    <th>Bank</th>
                    <th>Balance</th>
                </tr>
            </thead>
            <tbody>
`
        
        accounts.forEach((a: Account) => {
          const balanceClass = a.type === 'credit' ? (a.balance < 0 ? 'amount-negative' : 'amount-positive') : (a.balance >= 0 ? 'amount-positive' : 'amount-negative')
          
          html += `
                <tr>
                    <td>${a.name}</td>
                    <td>${a.type.charAt(0).toUpperCase() + a.type.slice(1)}</td>
                    <td>${a.bank || 'N/A'}</td>
                    <td class="${balanceClass}">$${a.balance.toLocaleString()}</td>
                </tr>
`
        })
        
        html += `
            </tbody>
        </table>
    </div>
`
      }
    }

    if (dataType === "all" || dataType === "goals") {
      const goals = dataType === "all" ? data.goals : data
      
      if (Array.isArray(goals) && goals.length > 0) {
        const totalTarget = goals.reduce((sum: number, g: SavingsGoal) => sum + g.targetAmount, 0)
        const totalCurrent = goals.reduce((sum: number, g: SavingsGoal) => sum + g.currentAmount, 0)
        const overallProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0

        html += `
    <div class="section">
        <h2>🎯 Savings Goals</h2>
        <div class="summary-card">
            <div class="summary-grid">
                <div class="summary-item">
                    <div class="summary-value">$${totalTarget.toLocaleString()}</div>
                    <div class="summary-label">Total Target</div>
                </div>
                <div class="summary-item">
                    <div class="summary-value amount-positive">$${totalCurrent.toLocaleString()}</div>
                    <div class="summary-label">Total Saved</div>
                </div>
                <div class="summary-item">
                    <div class="summary-value">${overallProgress.toFixed(1)}%</div>
                    <div class="summary-label">Overall Progress</div>
                </div>
                <div class="summary-item">
                    <div class="summary-value">${goals.length}</div>
                    <div class="summary-label">Active Goals</div>
                </div>
            </div>
        </div>
        
        <table>
            <thead>
                <tr>
                    <th>Goal Name</th>
                    <th>Target Amount</th>
                    <th>Current Amount</th>
                    <th>Progress</th>
                    <th>Target Date</th>
                    <th>Priority</th>
                </tr>
            </thead>
            <tbody>
`
        
        goals.forEach((g: SavingsGoal) => {
          const progress = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0
          
          html += `
                <tr>
                    <td>${g.name}</td>
                    <td>$${g.targetAmount.toLocaleString()}</td>
                    <td class="amount-positive">$${g.currentAmount.toLocaleString()}</td>
                    <td>${progress.toFixed(1)}%</td>
                    <td>${g.targetDate}</td>
                    <td>${g.priority}</td>
                </tr>
`
        })
        
        html += `
            </tbody>
        </table>
    </div>
`
      }
    }

    html += `
    <div class="footer">
        <p>This report was generated by Money Manager - Personal Finance Tracker</p>
        <p>Data is processed locally and remains private on your device</p>
    </div>
</body>
</html>
`

    return html
  }

  const handleExport = async () => {
    try {
      let data: any = {}
      let filename = `money-manager-export-${new Date().toISOString().split("T")[0]}`

      // Get data from localStorage
      const transactions = JSON.parse(localStorage.getItem("money-manager-transactions") || "[]")
      const accounts = JSON.parse(localStorage.getItem("money-manager-accounts") || "[]")
      const categories = JSON.parse(localStorage.getItem("money-manager-categories") || "[]")
      const goals = JSON.parse(localStorage.getItem("money-manager-goals") || "[]")

      // Filter by date range
      let filteredTransactions = transactions
      if (exportDateRange !== "all") {
        const now = new Date()
        let startDate: Date

        switch (exportDateRange) {
          case "current-month":
            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
            break
          case "last-month":
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
            break
          case "current-year":
            startDate = new Date(now.getFullYear(), 0, 1)
            break
          case "last-year":
            startDate = new Date(now.getFullYear() - 1, 0, 1)
            break
          default:
            startDate = new Date(0)
        }

        filteredTransactions = transactions.filter((t: Transaction) => 
          new Date(t.date) >= startDate
        )
      }

      // Prepare data based on type
      switch (exportDataType) {
        case "transactions":
          data = filteredTransactions
          filename += "-transactions"
          break
        case "accounts":
          data = accounts
          filename += "-accounts"
          break
        case "categories":
          data = categories
          filename += "-categories"
          break
        case "goals":
          data = goals
          filename += "-goals"
          break
        default:
          data = {
            transactions: filteredTransactions,
            accounts,
            categories,
            goals,
            exportDate: new Date().toISOString(),
            version: "1.0"
          }
          filename += "-complete"
      }

      // Generate file based on format
      let content: string
      let mimeType: string

      switch (exportFormat) {
        case "sql":
          content = createSQLDump(data, exportDataType)
          mimeType = "text/plain"
          filename += ".sql"
          break
        case "csv":
          if (exportDataType === "transactions" || exportDataType === "all") {
            const csvTransactions = exportDataType === "all" ? data.transactions : data
            content = "Date,Description,Category,Subcategory,Amount,Type,Account\n"
            content += csvTransactions.map((t: Transaction) => {
              const account = accounts.find((a: Account) => a.id === t.accountId)
              return `"${t.date}","${(t.description || '').replace(/"/g, '""')}","${(t.category || '').replace(/"/g, '""')}","${(t.subcategory || '').replace(/"/g, '""')}",${t.type === 'expense' ? -t.amount : t.amount},"${t.type}","${(account?.name || 'Unknown').replace(/"/g, '""')}"`
            }).join("\n")
          } else {
            content = JSON.stringify(data, null, 2)
          }
          mimeType = "text/csv"
          filename += ".csv"
          break
        case "json":
          content = JSON.stringify(data, null, 2)
          mimeType = "application/json"
          filename += ".json"
          break
        case "xlsx":
          content = createExcelCSV(data, exportDataType)
          mimeType = "text/csv"
          filename += ".csv" // Export as CSV for Excel compatibility
          break
        case "pdf":
          content = createPDFReport(data, exportDataType)
          mimeType = "text/html"
          filename += ".html" // Export as HTML that can be printed to PDF
          break
        default:
          content = JSON.stringify(data, null, 2)
          mimeType = "application/json"
          filename += ".json"
      }

      // Download file
      const blob = new Blob([content], { type: mimeType })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      a.click()
      window.URL.revokeObjectURL(url)

      // For PDF, open in new window for printing
      if (exportFormat === "pdf") {
        const printWindow = window.open('', '_blank')
        if (printWindow) {
          printWindow.document.write(content)
          printWindow.document.close()
          setTimeout(() => {
            printWindow.print()
          }, 500)
        }
      }
    } catch (error) {
      console.error("Export error:", error)
      alert("Export failed. Please try again.")
    }
  }

  const getDataStats = () => {
    try {
      const transactions = JSON.parse(localStorage.getItem("money-manager-transactions") || "[]")
      const accounts = JSON.parse(localStorage.getItem("money-manager-accounts") || "[]")
      const categories = JSON.parse(localStorage.getItem("money-manager-categories") || "[]")
      const goals = JSON.parse(localStorage.getItem("money-manager-goals") || "[]")

      return {
        transactions: transactions.length,
        accounts: accounts.length,
        categories: categories.length,
        goals: goals.length
      }
    } catch {
      return { transactions: 0, accounts: 0, categories: 0, goals: 0 }
    }
  }

  const stats = getDataStats()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Import & Export</h1>
        <p className="text-muted-foreground">Import transactions from other sources or export your data</p>
      </div>

      {/* Data Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Your Data Overview
          </CardTitle>
          <CardDescription>Current data in your Money Manager</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.transactions}</div>
              <div className="text-sm text-muted-foreground">Transactions</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.accounts}</div>
              <div className="text-sm text-muted-foreground">Accounts</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.categories}</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{stats.goals}</div>
              <div className="text-sm text-muted-foreground">Goals</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Import Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Data
            </CardTitle>
            <CardDescription>Import transactions from CSV, JSON, or SQL files</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="import-file">Select File</Label>
              <Input id="import-file" type="file" accept=".csv,.json,.sql" onChange={handleFileUpload} />
              <p className="text-sm text-muted-foreground">Supported formats: CSV, JSON, SQL</p>
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
                <div className="text-sm">
                  <div>Import failed</div>
                  {importError && <div className="text-xs mt-1">{importError}</div>}
                </div>
              </div>
            )}

            <Button onClick={handleImport} disabled={!importFile || importStatus === "processing"} className="w-full">
              {importStatus === "processing" ? "Importing..." : "Import Data"}
            </Button>

            <div className="space-y-2">
              <h4 className="font-medium">Supported Import Formats:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>CSV:</strong> date, description, amount, category, subcategory</li>
                <li>• <strong>JSON:</strong> Complete Money Manager backup files</li>
                <li>• <strong>SQL:</strong> Database scripts exported from Money Manager</li>
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
                  <SelectItem value="json">JSON (Complete Backup)</SelectItem>
                  <SelectItem value="xlsx">Excel Compatible CSV</SelectItem>
                  <SelectItem value="sql">SQL Database Script</SelectItem>
                  <SelectItem value="pdf">PDF Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="export-data-type">Data Type</Label>
              <Select value={exportDataType} onValueChange={setExportDataType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select data type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Data</SelectItem>
                  <SelectItem value="transactions">Transactions Only</SelectItem>
                  <SelectItem value="accounts">Accounts Only</SelectItem>
                  <SelectItem value="categories">Categories Only</SelectItem>
                  <SelectItem value="goals">Goals Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-range">Date Range (for transactions)</Label>
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
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleExport} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>

            <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
              <h4 className="font-medium text-blue-900 dark:text-blue-100">Data Privacy</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Your data is processed locally and never sent to external servers. All imports and exports happen entirely in your browser.
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
          <div className="grid gap-4 md:grid-cols-5">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent"
              onClick={() => {
                setExportDataType("transactions")
                setExportFormat("csv")
                setExportDateRange("current-month")
                handleExport()
              }}
            >
              <Download className="h-6 w-6" />
              <div className="text-center">
                <p className="font-medium">Export This Month</p>
                <p className="text-sm text-muted-foreground">CSV format</p>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent"
              onClick={() => {
                setExportDataType("all")
                setExportFormat("json")
                handleExport()
              }}
            >
              <Database className="h-6 w-6" />
              <div className="text-center">
                <p className="font-medium">Full Backup</p>
                <p className="text-sm text-muted-foreground">Complete JSON backup</p>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent"
              onClick={() => {
                setExportDataType("transactions")
                setExportFormat("xlsx")
                setExportDateRange("current-year")
                handleExport()
              }}
            >
              <FileText className="h-6 w-6" />
              <div className="text-center">
                <p className="font-medium">Excel Export</p>
                <p className="text-sm text-muted-foreground">For spreadsheet analysis</p>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent"
              onClick={() => {
                setExportDataType("all")
                setExportFormat("sql")
                handleExport()
              }}
            >
              <Database className="h-6 w-6" />
              <div className="text-center">
                <p className="font-medium">SQL Database</p>
                <p className="text-sm text-muted-foreground">Complete .sql script</p>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent"
              onClick={() => {
                setExportDataType("all")
                setExportFormat("pdf")
                handleExport()
              }}
            >
              <FileImage className="h-6 w-6" />
              <div className="text-center">
                <p className="font-medium">PDF Report</p>
                <p className="text-sm text-muted-foreground">Professional report</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
