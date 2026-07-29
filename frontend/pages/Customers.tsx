import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Mail, Phone, Eye, Search } from "lucide-react";
import Layout from "../components/Layout";
import Table, { type Column } from "../components/ui/Table";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Badge from "../components/ui/Badge";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../api/customers";

interface Customer {
  id: string;
  name: string;
  email: string;
  mobile: string;
  businessName?: string;
  gstNumber?: string;
  customerType?: string;
  address?: string;
  status?: string;
  followUpDate?: string;
  notes?: string;
}

type ModalType = "create" | "edit" | "view" | null;

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<Partial<Customer>>({});

  useEffect(() => {
    fetchCustomers();
  }, [search, statusFilter]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await getCustomers(1, 100, search, statusFilter);
      setCustomers(res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await createCustomer(formData);
      setModalType(null);
      setFormData({});
      fetchCustomers();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create customer");
    }
  };

  const handleUpdate = async () => {
    if (!selectedCustomer) return;
    try {
      await updateCustomer(selectedCustomer.id, formData);
      setModalType(null);
      setFormData({});
      fetchCustomers();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update customer");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    try {
      await deleteCustomer(id);
      fetchCustomers();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete customer");
    }
  };

  const openCreateModal = () => {
    setFormData({
      name: "",
      email: "",
      mobile: "",
      businessName: "",
      gstNumber: "",
      customerType: "RETAIL",
      address: "",
      status: "LEAD",
    });
    setModalType("create");
  };

  const openEditModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData(customer);
    setModalType("edit");
  };

  const openViewModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData(customer);
    setModalType("view");
  };

  const columns: Column<Customer>[] = [
    {
      key: "name",
      label: "Name",
      render: (_, customer) => (
        <div>
          <p className="font-medium text-slate-900">{customer.name}</p>
          <p className="text-xs text-slate-500">{customer.businessName}</p>
        </div>
      ),
    },
    {
      key: "email",
      label: "Contact",
      render: (_, customer) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Mail className="w-4 h-4" />
            {customer.email}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Phone className="w-4 h-4" />
            {customer.mobile}
          </div>
        </div>
      ),
    },
    {
      key: "customerType",
      label: "Type",
      render: (value) => (
        <Badge
          variant="info"
          label={value || "N/A"}
        />
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <Badge
          variant={
            value === "ACTIVE"
              ? "success"
              : value === "LEAD"
              ? "warning"
              : "danger"
          }
          label={value || "N/A"}
        />
      ),
    },
    {
      key: "followUpDate",
      label: "Follow-up",
      render: (value) =>
        value
          ? new Date(value).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          : "-",
    },
    {
      key: "id",
      label: "Actions",
      render: (_, customer) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openViewModal(customer)}
            className="p-2 hover:bg-blue-50 text-blue-600 rounded transition-colors"
            title="View"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => openEditModal(customer)}
            className="p-2 hover:bg-green-50 text-green-600 rounded transition-colors"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(customer.id)}
            className="p-2 hover:bg-red-50 text-red-600 rounded transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <Layout pageTitle="Customers">
      <div className="p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your customer database</p>
          </div>
          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={openCreateModal}
          >
            Add Customer
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Search by name, email, or mobile..."
              icon={<Search className="w-4 h-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select
              placeholder="Filter by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "LEAD", label: "Lead" },
                { value: "ACTIVE", label: "Active" },
                { value: "INACTIVE", label: "Inactive" },
              ]}
            />
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-600">
                Total: <span className="font-semibold">{customers.length}</span>
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600">
                Active:{" "}
                <span className="font-semibold text-green-600">
                  {customers.filter((c) => c.status === "ACTIVE").length}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <Table<Customer>
            columns={columns}
            data={customers}
            loading={loading}
            emptyMessage="No customers found"
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
        title={modalType === "create" ? "Add Customer" : "Edit Customer"}
        size="lg"
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
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Full Name"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Mobile"
              placeholder="+1-555-0000"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              placeholder="john@example.com"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Business Name"
              placeholder="Acme Corp"
              value={formData.businessName}
              onChange={(e) =>
                setFormData({ ...formData, businessName: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="GST Number"
              placeholder="29ABCDE1234F1Z5"
              value={formData.gstNumber}
              onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
            />
            <Select
              label="Customer Type"
              value={formData.customerType}
              onChange={(e) =>
                setFormData({ ...formData, customerType: e.target.value })
              }
              options={[
                { value: "RETAIL", label: "Retail" },
                { value: "WHOLESALE", label: "Wholesale" },
                { value: "DISTRIBUTOR", label: "Distributor" },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: "LEAD", label: "Lead" },
                { value: "ACTIVE", label: "Active" },
                { value: "INACTIVE", label: "Inactive" },
              ]}
            />
            <Input
              label="Follow-up Date"
              type="date"
              value={formData.followUpDate?.substring(0, 10)}
              onChange={(e) =>
                setFormData({ ...formData, followUpDate: e.target.value })
              }
            />
          </div>

          <Input
            label="Address"
            placeholder="123 Business St"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={modalType === "view"}
        onClose={() => {
          setModalType(null);
          setSelectedCustomer(null);
        }}
        title="Customer Details"
        size="md"
        footer={
          <Button
            variant="secondary"
            onClick={() => {
              setModalType(null);
              setSelectedCustomer(null);
            }}
          >
            Close
          </Button>
        }
      >
        {selectedCustomer && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="font-semibold text-slate-900 mb-3">
                {selectedCustomer.name}
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Email</p>
                  <p className="font-medium text-slate-900">
                    {selectedCustomer.email}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Mobile</p>
                  <p className="font-medium text-slate-900">
                    {selectedCustomer.mobile}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Type</p>
                  <p className="font-medium text-slate-900">
                    {selectedCustomer.customerType || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Status</p>
                  <p className="font-medium text-slate-900">
                    {selectedCustomer.status || "N/A"}
                  </p>
                </div>
                {selectedCustomer.businessName && (
                  <div>
                    <p className="text-slate-500">Business Name</p>
                    <p className="font-medium text-slate-900">
                      {selectedCustomer.businessName}
                    </p>
                  </div>
                )}
                {selectedCustomer.gstNumber && (
                  <div>
                    <p className="text-slate-500">GST Number</p>
                    <p className="font-medium text-slate-900">
                      {selectedCustomer.gstNumber}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {selectedCustomer.notes && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-slate-500 mb-2">Notes</p>
                <p className="text-sm text-slate-900">{selectedCustomer.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </Layout>
  );
}
