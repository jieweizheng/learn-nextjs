export const dynamic = 'force-dynamic';
// app/dashboard/page.tsx —— 这一步做完后的完整页面（前两步加的都在里面）
import {
    fetchCardData,
  } from '@/app/lib/data';
import RevenueChart from '@/app/ui/dashboard/revenue-chart';
import LatestInvoices from '@/app/ui/dashboard/latest-invoices';
import CardWrapper from '@/app/ui/dashboard/cards'; // ← Card 是具名导出，要带花括号
import { Suspense } from 'react';
import { CardsSkeleton, LatestInvoicesSkeleton, RevenueChartSkeleton } from '@/app/ui/skeletons';
import { Metadata } from 'next';
  
export const metadata: Metadata = {
  title: 'Dashboard'
}

  export default async function Page() {
    const {
      numberOfInvoices,
      numberOfCustomers,
      totalPaidInvoices,
      totalPendingInvoices,
    } = await fetchCardData();
  
    return (
      <main>
        <h1 className="mb-4 text-xl md:text-2xl">Dashboard</h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Suspense fallback={<CardsSkeleton />}>
            <CardWrapper />
          </Suspense>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
          <Suspense fallback={<RevenueChartSkeleton />}>
            <RevenueChart />            
          </Suspense>
          <Suspense fallback={<LatestInvoicesSkeleton />}>
            <LatestInvoices />
          </Suspense>
        </div>
      </main>
    );
  }