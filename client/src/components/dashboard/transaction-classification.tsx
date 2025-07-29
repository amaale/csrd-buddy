import { Car, Zap, Plane, Bot } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { type Transaction } from "@shared/schema";

interface TransactionClassificationProps {
  transactions?: Transaction[];
  isLoading: boolean;
}

export function TransactionClassification({ transactions, isLoading }: TransactionClassificationProps) {
  if (isLoading) {
    return (
      <Card className="material-shadow-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-6 w-16" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 w-16 mb-1" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get top transactions by emissions
  const topTransactions = transactions
    ?.filter(t => t.co2Emissions)
    ?.sort((a, b) => parseFloat(b.co2Emissions || '0') - parseFloat(a.co2Emissions || '0'))
    ?.slice(0, 3) || [];

  const getTransactionIcon = (category: string | null) => {
    if (!category) return Car;
    const cat = category.toLowerCase();
    if (cat.includes('transport') || cat.includes('fuel')) return Car;
    if (cat.includes('energy') || cat.includes('electricity')) return Zap;
    if (cat.includes('travel') || cat.includes('flight')) return Plane;
    return Car;
  };

  const getIconBg = (scope: number | null) => {
    switch (scope) {
      case 1: return "bg-error/10";
      case 2: return "bg-warning/10";
      case 3: return "bg-secondary/10";
      default: return "bg-primary/10";
    }
  };

  const getIconColor = (scope: number | null) => {
    switch (scope) {
      case 1: return "text-error";
      case 2: return "text-warning";
      case 3: return "text-secondary";
      default: return "text-primary";
    }
  };

  return (
    <Card className="material-shadow-1">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-neutral-900">Transaction Classification</CardTitle>
          <Button variant="ghost" className="text-sm text-primary hover:text-primary-dark font-medium">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-neutral-500">No transactions available</p>
              <p className="text-sm text-neutral-400">Upload expense data to see classifications</p>
            </div>
          ) : (
            topTransactions.map((transaction) => {
              const IconComponent = getTransactionIcon(transaction.category);
              return (
                <div key={transaction.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 ${getIconBg(transaction.scope)} rounded-lg flex items-center justify-center`}>
                      <IconComponent className={`${getIconColor(transaction.scope)} w-5 h-5`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">{transaction.description}</p>
                      <p className="text-xs text-neutral-500">
                        {transaction.category || 'Unknown'} - Scope {transaction.scope || 3}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-neutral-900">€{parseFloat(transaction.amount).toFixed(0)}</p>
                    <p className="text-xs text-neutral-500">{parseFloat(transaction.co2Emissions || '0').toFixed(1)} tCO₂e</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-6 p-4 bg-secondary/5 rounded-lg">
          <div className="flex items-center space-x-2">
            <Bot className="text-secondary w-4 h-4" />
            <span className="text-sm font-medium text-secondary">AI Classification</span>
          </div>
          <p className="text-xs text-neutral-600 mt-1">
            95% accuracy rate with continuous learning from your data patterns
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
