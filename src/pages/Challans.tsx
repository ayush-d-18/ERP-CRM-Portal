import { useEffect, useState } from "react";
import { Plus, CheckCircle, XCircle, Eye } from "lucide-react";
import Layout from "../components/Layout";
import Table, { type Column } from "../components/ui/Table";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Select from "../components/ui/Select";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";
import {
  getChallans,
  createChallan,
  confirmChallan,
  cancelChallan,
} from "../api/challans";
import { getCustomers } from "../api/customers";
import { getProducts } from "../api/products";

interface ChallanData {
  id: string;
  challanNumber: string;
  customer: { name: string; id: string };
  totalAmount: number;
  status: string;
  createdAt: string;
  items?: any[];
}

interface ChallanItem {
  productId: string;
  quantity: number;
}

type ModalType = "create" | "view" | null;

export default function Challans() {
  const [challans, setChallans] = useState<ChallanData[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedChallan, setSelectedChallan] = useState<ChallanData | null>(null);
  const [error, setError] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [items, setItems] = useState<ChallanItem[]>([{ productId: "", quantity: 0 }]);

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [challansRes, customersRes, productsRes] = await Promise.all([
        getChallans(1, 50, statusFilter),
        getCustomers(1, 100),
        getProducts(),
      ]);
      setChallans(challansRes.data || []);
      setCustomers(customersRes.data || []);
      setProducts(productsRes.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChallan = async () => {
    if (!selectedCustomer || items.some((i) => !i.productId || i.quantity === 0)) {
      setError("Please select customer and add valid items");
      return;
    }

    try {
      await createChallan(selectedCustomer, items);
      setModalType(null);
      setSelectedCustomer("");
      setItems([{ productId: "", quantity: 0 }]);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create challan");
    }
  };

  const handleConfirmChallan = async (id: string) => {
    if (!confirm("Confirm this challan?")) return;
    try {
      await confirmChallan(id);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to confirm");
    }
  };

  const handleCancelChallan = async (id: string) => {
    if (!confirm("Cancel this challan?")) return;
    try {
      await cancelChallan(id);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to cancel");
    }
  };

  const columns: Column<ChallanData>[] = [
    {
      key: "challanNumber",
      label: "Challan",
    },
    {
      key: "customer",
      label: "Customer",
      render: (_, c) => c.customer?.name || "Unknown",
    },
    {
      key: "totalAmount",
      label: "Amount",
      render: (v) => `₹${(v as number).toFixed(2)}`,
    },
    {
      key: "status",
      label: "Status",
      render: (v) => (
        <Badge
          variant={v === "CONFIRMED" ? "success" : v === "DRAFT" ? "warning" : "danger"}
          label={v as string}
        />
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      render: (v) =>
        new Date(v as string).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
    },
    {
      key: "id",
      label: "Actions",
      render: (_, c) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelectedChallan(c);
              setModalType("view");
            }}
            className="p-2 hover:bg-blue-50 text-blue-600 rounded"
          >
            <Eye className="w-4 h-4" />
          </button>
          {c.status === "DRAFT" && (
            <>
              <button
                onClick={() => handleConfirmChallan(c.id)}
                className="p-2 hover:bg-green-50 text-green-600 rounded"
                title="Confirm"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleCancelChallan(c.id)}
                className="p-2 hover:bg-red-50 text-red-600 rounded"
                title="Cancel"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  const getProductPrice = (productId: string) => {
    return products.find((p) => p.id === productId)?.unitPrice || 0;
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + getProductPrice(item.productId) * item.quantity, 0);
  };

  return (
    <Layout pageTitle="Sales Challans">
      <div className="p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Sales Challans</h1>
            <p className="text-sm text-slate-500 mt-1">Manage sales orders</p>
          </div>
          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setModalType("create");
              setSelectedCustomer("");
              setItems([{ productId: "", quantity: 0 }]);
            }}
          >
            New Challan
          </Button>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <Select
            placeholder="Filter by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: "DRAFT", label: "Draft" },
              { value: "CONFIRMED", label: "Confirmed" },
              { value: "CANCELLED", label: "Cancelled" },
            ]}
          />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <Table<ChallanData>
            columns={columns}
            data={challans}
            loading={loading}
            emptyMessage="No challans found"
          />
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={modalType === "create"}
        onClose={() => {
          setModalType(null);
          setSelectedCustomer("");
          setItems([{ productId: "", quantity: 0 }]);
        }}
        title="Create Challan"
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setModalType(null);
                setSelectedCustomer("");
                setItems([{ productId: "", quantity: 0 }]);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateChallan}
            >
              Save as Draft
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Select Customer"
            placeholder="Choose customer..."
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            options={customers.map((c) => ({
              value: c.id,
              label: `${c.name} (${c.email})`,
            }))}
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Items
            </label>
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <Select
                  value={item.productId}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[idx].productId = e.target.value;
                    setItems(newItems);
                  }}
                  options={products.map((p) => ({
                    value: p.id,
                    label: `${p.name} - ₹${p.unitPrice}`,
                  }))}
                />
                <Input
                  type="number"
                  placeholder="Qty"
                  className="w-24"
                  value={String(item.quantity)}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[idx].quantity = parseInt(e.target.value);
                    setItems(newItems);
                  }}
                />
                <button
                  onClick={() => setItems(items.filter((_, i) => i !== idx))}
                  className="px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}

            <button
              onClick={() => setItems([...items, { productId: "", quantity: 0 }])}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2"
            >
              + Add Item
            </button>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-sm text-slate-600 mb-1">Order Total</p>
            <p className="text-2xl font-bold text-slate-900">
              ₹{calculateTotal().toFixed(2)}
            </p>
          </div>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={modalType === "view"}
        onClose={() => {
          setModalType(null);
          setSelectedChallan(null);
        }}
        title="Challan Details"
        size="md"
      >
        {selectedChallan && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Challan No</p>
                  <p className="font-semibold">{selectedChallan.challanNumber}</p>
                </div>
                <div>
                  <p className="text-slate-500">Customer</p>
                  <p className="font-semibold">{selectedChallan.customer?.name}</p>
                </div>
                <div>
                  <p className="text-slate-500">Amount</p>
                  <p className="font-semibold">₹{selectedChallan.totalAmount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Status</p>
                  <Badge
                    variant={
                      selectedChallan.status === "CONFIRMED"
                        ? "success"
                        : "warning"
                    }
                    label={selectedChallan.status}
                  />
                </div>
              </div>
            </div>

            {selectedChallan.items && selectedChallan.items.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-slate-900 mb-2">Items</p>
                <div className="space-y-2">
                  {selectedChallan.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm bg-slate-50 p-2 rounded">
                      <span>{item.productName} (x{item.quantity})</span>
                      <span className="font-medium">₹{item.totalPrice.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </Layout>
  );
}
