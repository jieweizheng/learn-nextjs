import { fetchRevenue } from "../lib/data";
import RevenueChart from '@/app/ui/dashboard/revenue-chart'

export default async function Page () {
    const revenue = await fetchRevenue()
    return <RevenueChart revenue={revenue} />
}