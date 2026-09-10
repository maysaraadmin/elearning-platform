import { useState, useEffect } from 'react';
import { Table, Pagination, Loading, EmptyState, ErrorState, Card } from '../components/ui';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Dropdown } from '../components/ui/Dropdown';
import { ConfirmDialog } from '../components/forms/ConfirmDialog';
import { FormField, FormActions, FormSection, FormRow } from '../components/forms';
import { PageHeader } from '../components/layout/MainLayout';
import { ordersApi } from '../api/client';
import { Order, PaginatedResponse } from '../types';
import { usePagination } from '../hooks/useApi';
import { formatDate, formatCurrency, classNames } from '../utils/helpers';

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'cancelled', label: 'Cancelled' },
];

const paymentMethodOptions = [
  { value: 'stripe', label: 'Stripe' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
];

export function PaymentsPage() {
  const [data, setData] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  const { page, pageSize, totalPages, totalItems, setPage, setPageSize, updateFromResponse, reset } = usePagination();

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await ordersApi.list(page, pageSize);
      setData(response.items);
      updateFromResponse(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, pageSize, search, statusFilter]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    reset();
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    reset();
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    reset();
  };

  const openCreateModal = () => {
    setEditingOrder(null);
    setIsModalOpen(true);
  };

  const openEditModal = (order: Order) => {
    setEditingOrder(order);
    setIsModalOpen(true);
  };

  const handleDelete = (order: Order) => {
    setOrderToDelete(order);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;
    try {
      await ordersApi.delete(orderToDelete.id);
      fetchOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete order');
    } finally {
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
    }
  };

  const totalRevenue = data.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.amount, 0);
  const pendingRevenue = data.filter(o => o.status === 'pending').reduce((sum, o) => sum + o.amount, 0);
  const refundedAmount = data.filter(o => o.status === 'refunded').reduce((sum, o) => sum + o.amount, 0);

  const columns = [
    { key: 'id', header: 'Order ID', render: (o: Order) => <span className="font-mono text-sm">{o.id.slice(0, 8)}...</span> },
    { key: 'user_id', header: 'User', render: (o: Order) => o.user_id },
    { key: 'course_id', header: 'Course', render: (o: Order) => o.course_id },
    { key: 'amount', header: 'Amount', render: (o: Order) => formatCurrency(o.amount, o.currency) },
    { key: 'status', header: 'Status', render: (o: Order) => <Badge variant="status" status={o.status}>{o.status}</Badge> },
    { key: 'payment_method', header: 'Method', render: (o: Order) => <Badge variant="default" size="sm">{o.payment_method}</Badge> },
    { key: 'payment_intent_id', header: 'Transaction', render: (o: Order) => o.payment_intent_id ? <span className="font-mono text-sm">{o.payment_intent_id.slice(0, 12)}...</span> : '—' },
    { key: 'created_at', header: 'Created', render: (o: Order) => formatDate(o.created_at) },
    {
      key: 'actions',
      header: '',
      width: '100px',
      render: (o: Order) => (
        <Dropdown
          trigger={<Button variant="ghost" size="sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg></Button>}
          items={[
            { label: 'View', onClick: () => openEditModal(o), icon: <EyeIcon className="w-4 h-4" /> },
            { label: 'Delete', onClick: () => handleDelete(o), icon: <TrashIcon className="w-4 h-4" />, danger: true },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Manage orders and payment transactions"
        action={<Button onClick={openCreateModal}>Create Order</Button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card padding="md">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
        </Card>
        <Card padding="md">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{formatCurrency(pendingRevenue)}</p>
        </Card>
        <Card padding="md">
          <p className="text-sm text-gray-500">Refunded</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(refundedAmount)}</p>
        </Card>
      </div>

      <Card padding="md">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <Input
            placeholder="Search orders..."
            value={search}
            onChange={handleSearch}
            className="flex-1 max-w-md"
          />
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={handleStatusChange}
            className="w-48"
          />
        </div>

        {isLoading ? (
          <Loading />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchOrders} />
        ) : data.length === 0 ? (
          <EmptyState title="No orders found" description="No payment orders yet" />
        ) : (
          <>
            <Table
              columns={columns}
              data={data}
              keyExtractor={(o) => o.id}
              isLoading={isLoading}
            />
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              showPageSize
              pageSize={pageSize}
              onPageSizeChange={handlePageSizeChange}
            />
          </>
        )}
      </Card>

      <OrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={editingOrder}
        onSubmit={async (formData) => {
          setIsSubmitting(true);
          try {
            if (editingOrder) {
              await ordersApi.update(editingOrder.id, formData);
            } else {
              await ordersApi.create(formData);
            }
            setIsModalOpen(false);
            fetchOrders();
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save order');
          } finally {
            setIsSubmitting(false);
          }
        }}
        isSubmitting={isSubmitting}
      />

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Order"
        message={orderToDelete ? `Are you sure you want to delete order ${orderToDelete.id.slice(0, 8)}...?` : 'Are you sure?'}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}

function OrderModal({ isOpen, onClose, order, onSubmit, isSubmitting }: { isOpen: boolean; onClose: () => void; order: Order | null; onSubmit: (data: Partial<Order>) => Promise<void>; isSubmitting: boolean }) {
  const [formData, setFormData] = useState<Partial<Order>>({
    user_id: '',
    course_id: '',
    amount: 0,
    currency: 'USD',
    status: 'pending',
    payment_method: 'stripe',
  });

  useEffect(() => {
    if (order) {
      setFormData({
        user_id: order.user_id,
        course_id: order.course_id,
        amount: order.amount,
        currency: order.currency,
        status: order.status,
        payment_method: order.payment_method,
      });
    } else {
      setFormData({ user_id: '', course_id: '', amount: 0, currency: 'USD', status: 'pending', payment_method: 'stripe' });
    }
  }, [order, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={order ? 'Edit Order' : 'Create Order'} size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSection title="Order Details">
          <FormRow>
            <FormField label="User ID" required>
              <Input value={formData.user_id} onChange={(e) => setFormData({ ...formData, user_id: e.target.value })} required placeholder="User UUID" disabled={!!order} />
            </FormField>
            <FormField label="Course ID" required>
              <Input value={formData.course_id} onChange={(e) => setFormData({ ...formData, course_id: e.target.value })} required placeholder="Course UUID" disabled={!!order} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Amount" required>
              <Input type="number" value={formData.amount || 0} onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })} required min={0} step={0.01} />
            </FormField>
            <FormField label="Currency">
              <Input value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })} placeholder="USD" />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Status">
              <Select
                options={[{ value: 'pending', label: 'Pending' }, { value: 'completed', label: 'Completed' }, { value: 'failed', label: 'Failed' }, { value: 'refunded', label: 'Refunded' }, { value: 'cancelled', label: 'Cancelled' }]}
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              />
            </FormField>
            <FormField label="Payment Method">
              <Select
                options={paymentMethodOptions}
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as any })}
              />
            </FormField>
          </FormRow>
        </FormSection>

        <FormActions onSubmit={handleSubmit} onCancel={onClose} isSubmitting={isSubmitting} submitLabel={order ? 'Update' : 'Create'} />
      </form>
    </Modal>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
}
function TrashIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
}