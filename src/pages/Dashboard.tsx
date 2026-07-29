import { useEffect, useState } from "react";
import { Users, UserCheck, Package, AlertTriangle } from "lucide-react";
import Layout from "../components/Layout";
import StatsCard from "../components/ui/StatsCard";
import Table, { type Column } from "../components/ui/Table";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { getCustomers } from "../api/customers";
import { getProducts } from "../api/products";
import { getChallans } from "../api/challans";

interface ChallanData {
  id: string;
  challanNumber: string;
  customer: { name: string };
  totalAmount: number;
  status: string;
  createdAt: string;
  items?: any[];
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    totalProducts: 0,
    lowStockCount: 0,
  });
  const [challans, setChallans] = useState<ChallanData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const customersRes = await getCustomers(1, 1000);
      const productsRes = await getProducts();
      const challansRes = await getChallans(1, 10);

      const allCustomers = customersRes.data || [];
      const allProducts = productsRes.data || [];

      const activeCount = allCustomers.filter(
        (c: any) => c.status === "ACTIVE"
      ).length;
      const lowStockCount = allProducts.filter(
        (p: any) => p.currentStock < p.minStockLevel
      ).length;

      setStats({
        totalCustomers: customersRes.pagination?.total || allCustomers.length,
        activeCustomers: activeCount,
        totalProducts: allProducts.length,
        lowStockCount,
      });

      setChallans(challansRes.data || []);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const challanColumns: Column<ChallanData>[] = [
    {
      key: "challanNumber",
      label: "Challan No",
    },
    {
      key: "customer",
      label: "Customer",
      render: (value: any) => value?.name || "Unknown",
    },
    {
      key: "totalAmount",
      label: "Amount",
      render: (value: number) => `₹${value.toFixed(2)}`,
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <Badge
          variant={
            value === "CONFIRMED"
              ? "success"
              : value === "DRAFT"
              ? "warning"
              : "danger"
          }
          label={value}
        />
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      render: (value: string) =>
        new Date(value).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
    },
  ];

  return (
    <Layout pageTitle="Dashboard">
      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Customers"
            value={stats.totalCustomers}
            icon={<Users className="w-6 h-6" />}
            color="blue"
            loading={loading}
          />
          <StatsCard
            title="Active Customers"
            value={stats.activeCustomers}
            icon={<UserCheck className="w-6 h-6" />}
            color="green"
            loading={loading}
          />
          <StatsCard
            title="Total Products"
            value={stats.totalProducts}
            icon={<Package className="w-6 h-6" />}
            color="purple"
            loading={loading}
          />
          <StatsCard
            title="Low Stock Alerts"
            value={stats.lowStockCount}
            icon={<AlertTriangle className="w-6 h-6" />}
            color="red"
            loading={loading}
            subtitle={stats.lowStockCount > 0 ? "Action needed" : "All good"}
          />
        </div>

        {/* Recent Challans Section */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Recent Challans</h3>
              <p className="text-sm text-slate-500 mt-1">Latest sales orders</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => window.location.href = "/challans"}
            >
              View All
            </Button>
          </div>

          <Table<ChallanData>
            columns={challanColumns}
            data={challans}
            loading={loading}
            emptyMessage="No challans yet"
          />
        </div>

        {/* Quick Stats Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">This Month</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">
                  {challans.filter(
                    (c) =>
                      new Date(c.createdAt).getMonth() === new Date().getMonth()
                  ).length}
                </p>
                <p className="text-xs text-slate-500 mt-1">Challans created</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-xl p-6 border border-green-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Confirmed</p>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  {challans.filter((c) => c.status === "CONFIRMED").length}
                </p>
                <p className="text-xs text-slate-500 mt-1">Completed orders</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 mt-2">
                  {challans.filter((c) => c.status === "DRAFT").length}
                </p>
                <p className="text-xs text-slate-500 mt-1">Drafts awaiting</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
