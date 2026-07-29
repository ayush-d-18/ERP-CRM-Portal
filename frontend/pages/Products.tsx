import { useEffect, useState } from "react";
import { Plus, Pencil, ArrowUpDown, AlertTriangle, Search } from "lucide-react";
import Layout from "../components/Layout";
import Table, { type Column } from "../components/ui/Table";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import {
  getProducts,
  createProduct,
  updateProduct,
  addStockMovement,
} from "../api/products";

interface Product {
  id: string;
  name: string;
  sku: string;
  category?: string;
  unitPrice: number;
  currentStock: number;
  minStockLevel: number;
  warehouse?: string;
}

type ModalType = "create" | "edit" | "movement" | null;

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [movementData, setMovementData] = useState({
    type: "IN",
    quantity: 0,
    reason: "",
  });

  useEffect(() => {
    fetchProducts();
  }, [search, category]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await getProducts(search, category);
      setProducts(res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await createProduct(formData);
      setModalType(null);
      setFormData({});
      fetchProducts();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create product");
    }
  };

  const handleUpdate = async () => {
    if (!selectedProduct) return;
    try {
      await updateProduct(selectedProduct.id, formData);
      setModalType(null);
      setFormData({});
      fetchProducts();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update product");
    }
  };

  const handleStockMovement = async () => {
    if (!selectedProduct) return;
    try {
      await addStockMovement(
        selectedProduct.id,
        movementData.quantity,
        movementData.type,
        movementData.reason
      );
      setModalType(null);
      setMovementData({ type: "IN", quantity: 0, reason: "" });
      fetchProducts();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to record movement");
    }
  };

  const columns: Column<Product>[] = [
    {
      key: "name",
      label: "Product",
      render: (_, product) => (
        <div>
          <p className="font-medium text-slate-900">{product.name}</p>
          <p className="text-xs text-slate-500">{product.sku}</p>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
    },
    {
      key: "unitPrice",
      label: "Price",
      render: (value) => `₹${value.toFixed(2)}`,
    },
    {
      key: "currentStock",
      label: "Stock",
      render: (value, product) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{value}</span>
          {value < product.minStockLevel && (
            <AlertTriangle className="w-4 h-4 text-red-500" />
          )}
        </div>
      ),
    },
    {
      key: "minStockLevel",
      label: "Min Level",
    },
    {
      key: "warehouse",
      label: "Warehouse",
    },
    {
      key: "id",
      label: "Actions",
      render: (_, product) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedProduct(product);
              setFormData(product);
              setModalType("edit");
            }}
            className="p-2 hover:bg-green-50 text-green-600 rounded transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSelectedProduct(product);
              setMovementData({ type: "IN", quantity: 0, reason: "" });
              setModalType("movement");
            }}
            className="p-2 hover:bg-blue-50 text-blue-600 rounded transition-colors"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <Layout pageTitle="Products">
      <div className="p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Products</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your inventory</p>
          </div>
          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setFormData({ unitPrice: 0, minStockLevel: 10, currentStock: 0 });
              setModalType("create");
            }}
          >
            Add Product
          </Button>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Search by name or SKU..."
              icon={<Search className="w-4 h-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Input
              placeholder="Filter by category..."
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <Table<Product>
            columns={columns}
            data={products}
            loading={loading}
            emptyMessage="No products found"
          />
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalType === "create" || modalType === "edit"}
        onClose={() => {
          setModalType(null);
          setFormData({});
        }}
        title={modalType === "create" ? "Add Product" : "Edit Product"}
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setModalType(null);
                setFormData({});
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={modalType === "create" ? handleCreate : handleUpdate}
            >
              {modalType === "create" ? "Create" : "Update"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Product Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="SKU"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Category"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            />
            <Input
              label="Unit Price"
              type="number"
              value={String(formData.unitPrice || "")}
              onChange={(e) =>
                setFormData({ ...formData, unitPrice: parseFloat(e.target.value) })
              }
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Min Stock Level"
              type="number"
              value={String(formData.minStockLevel || "")}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  minStockLevel: parseInt(e.target.value),
                })
              }
            />
            <Input
              label="Warehouse"
              value={formData.warehouse}
              onChange={(e) =>
                setFormData({ ...formData, warehouse: e.target.value })
              }
            />
          </div>
        </div>
      </Modal>

      {/* Stock Movement Modal */}
      <Modal
        isOpen={modalType === "movement"}
        onClose={() => {
          setModalType(null);
          setMovementData({ type: "IN", quantity: 0, reason: "" });
        }}
        title="Stock Movement"
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setModalType(null);
                setMovementData({ type: "IN", quantity: 0, reason: "" });
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleStockMovement}
            >
              Record
            </Button>
          </>
        }
      >
        {selectedProduct && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-3 rounded text-sm">
              <p className="text-slate-500">Product</p>
              <p className="font-semibold text-slate-900">{selectedProduct.name}</p>
            </div>

            <div className="flex gap-4">
              {["IN", "OUT"].map((t) => (
                <label key={t} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={movementData.type === t}
                    onChange={() => setMovementData({ ...movementData, type: t })}
                    className="w-4 h-4"
                  />
                  <span className={`text-sm font-medium ${t === "IN" ? "text-green-600" : "text-red-600"}`}>
                    Stock {t}
                  </span>
                </label>
              ))}
            </div>

            <Input
              label="Quantity"
              type="number"
              value={String(movementData.quantity || "")}
              onChange={(e) =>
                setMovementData({
                  ...movementData,
                  quantity: parseInt(e.target.value),
                })
              }
              required
            />

            <Input
              label="Reason"
              value={movementData.reason}
              onChange={(e) =>
                setMovementData({ ...movementData, reason: e.target.value })
              }
              placeholder="e.g., Purchase, Damage, Sale"
            />
          </div>
        )}
      </Modal>
    </Layout>
  );
}
