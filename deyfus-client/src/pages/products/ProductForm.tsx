import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApi, resolveImageUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Swal from "sweetalert2";
import QRCode from "react-qr-code";
import { ArrowLeft, Save, X, Loader2, ShoppingBag } from "lucide-react";

interface Category { id: string; name: string }
interface Branch { id: string; name: string }

interface ProductFormData {
  name: string;
  sku?: string;
  price: string;
  cost?: string;
  categoryId: string;
  branchId: string;
  description?: string;
  brand?: string;
  imageUrl?: string;
  qrCode?: string;
  initialStock?: string;
}

export default function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const { get, post, put } = useApi();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageCredit, setImageCredit] = useState<string | null>(null);
  const [imageSourceUrl, setImageSourceUrl] = useState<string | null>(null);
  const [imageLicense, setImageLicense] = useState<string | null>(null);
  const [imageLicenseUrl, setImageLicenseUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    price: "0.00",
    categoryId: "",
    branchId: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [cats, brs] = await Promise.all([
          get("/api/categories"),
          get("/api/branches"),
        ]);
        setCategories(cats?.data ?? cats ?? []);
        setBranches(brs?.data ?? brs ?? []);

        if (isEditing && id) {
          const prod = await get(`/api/products/${id}`);
          const p = prod?.data ?? prod;
          setFormData({
            name: p.name || "",
            sku: p.sku,
            price: p.price?.toString() ?? "0.00",
            cost: p.cost?.toString() ?? "",
            categoryId: p.categoryId?.toString() ?? "",
            branchId: p.branchId?.toString() ?? "",
            description: p.description ?? "",
            brand: p.brand ?? "",
            imageUrl: p.imageUrl ?? "",
            qrCode: p.qrCode ?? "",
            initialStock: p.initialStock?.toString() ?? "",
          });
          if (p.imageUrl) {
            setImagePreview(resolveImageUrl(p.imageUrl) ?? null);
          }
          setImageCredit(p.imageCredit ?? null);
          setImageSourceUrl(p.imageSourceUrl ?? null);
          setImageLicense(p.imageLicense ?? null);
          setImageLicenseUrl(p.imageLicenseUrl ?? null);
        }
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "No se pudieron cargar datos", "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [get, id, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target as any;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!formData.name || formData.name.trim() === "") {
      Swal.fire("Error", "El nombre es requerido", "error");
      return false;
    }
    if (!formData.sku || formData.sku.trim() === "") {
      Swal.fire("Error", "El SKU es requerido", "error");
      return false;
    }
    if (!formData.categoryId) {
      Swal.fire("Error", "La categoría es requerida", "error");
      return false;
    }
    if (!formData.branchId) {
      Swal.fire("Error", "La sucursal es requerida", "error");
      return false;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      Swal.fire("Error", "El precio debe ser mayor a 0", "error");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      // Ensure qrCode is present. Use provided qrCode, else use SKU or generate one.
      const payload = { ...formData } as any;
      if (!payload.qrCode || payload.qrCode.trim() === "") {
        payload.qrCode = (formData.sku && formData.sku.trim() !== "") ? formData.sku : `prod-${Date.now()}`;
      }

  if (isEditing && id) {
    const updated = await put(`/api/products/${id}`, payload);
    if (updated.imageWarning) {
      await Swal.fire({
        icon: 'warning',
        title: 'Producto actualizado sin imagen',
        text: updated.imageWarning
      });
    } else {
      await Swal.fire({ icon: "success", title: "Producto actualizado" });
    }
      } else {
        const created = await post("/api/products", payload);
        if (created.imageWarning) {
          await Swal.fire({
            icon: 'warning',
            title: 'Producto creado sin imagen',
            text: created.imageWarning
          });
        } else {
          await Swal.fire({ icon: "success", title: "Producto creado" });
        }
      }
      navigate("/dashboard/products");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo guardar el producto", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Se perderán los cambios no guardados",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Salir",
      cancelButtonText: "Continuar"
    }).then(result => {
      if (result.isConfirmed) navigate("/dashboard/products");
    });
  };

  if (loading) return <div className="text-center py-10">Cargando...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => navigate('/dashboard/products')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Volver
        </Button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShoppingBag className="w-6 h-6" /> {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nombre*</Label>
              <Input name="name" value={formData.name} onChange={handleChange} />
            </div>
            <div>
              <Label>SKU</Label>
              <Input name="sku" value={formData.sku || ''} onChange={handleChange} disabled={isEditing} />
            </div>
            <div>
              <Label>Categoría*</Label>
              <Select name="categoryId" value={formData.categoryId} onChange={handleChange}>
                <option value="">Seleccionar categoría</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </div>
            <div>
              <Label>Sucursal*</Label>
              <Select name="branchId" value={formData.branchId} onChange={handleChange}>
                <option value="">Seleccionar sucursal</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </Select>
            </div>

            <div>
              <Label>Precio*</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">S/</span>
                <Input name="price" type="number" step="0.01" className="pl-8" value={formData.price} onChange={handleChange} />
              </div>
            </div>
            <div>
              <Label>Costo</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">S/</span>
                <Input name="cost" type="number" step="0.01" className="pl-8" value={formData.cost || ''} onChange={handleChange} />
              </div>
            </div>

            <div className="md:col-span-2">
              <Label>Descripción</Label>
              <textarea name="description" aria-label="Descripción" rows={4} className="w-full border rounded-md px-3 py-2" value={formData.description || ''} onChange={handleChange} />
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <Label>Imagen del producto</Label>
            <div className="mt-2 flex min-h-48 items-center justify-center rounded-md bg-slate-50 p-4">
              {imagePreview ? (
                <div className="text-center">
                  <img src={imagePreview} alt={formData.name || 'Imagen del producto'} className="mx-auto max-h-40 object-contain" />
                  {imageCredit && imageSourceUrl && imageLicense && imageLicenseUrl && (
                    <p className="mt-2 text-xs text-slate-500">
                      <a href={imageSourceUrl} target="_blank" rel="noreferrer" className="underline">Foto: {imageCredit}</a>
                      {' · '}
                      <a href={imageLicenseUrl} target="_blank" rel="noreferrer" className="underline">{imageLicense}</a>
                      {' · Wikimedia Commons'}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center text-sm text-slate-500">
                  <ShoppingBag className="mx-auto mb-2 h-10 w-10 text-slate-400" />
                  <p>La imagen se buscará automáticamente al crear el producto.</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-4">
            <Label>QR Preview</Label>
            <div className="mt-2 bg-white p-4 inline-block">
              <QRCode value={formData.name || 'Nuevo producto'} size={128} />
            </div>
          </Card>

          <Card className="p-4">
            <Label>Stock inicial</Label>
            <Input name="initialStock" type="number" value={formData.initialStock || ''} onChange={handleChange} />
          </Card>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={handleCancel}><X className="w-4 h-4 mr-2" />Cancelar</Button>
          <Button type="submit" disabled={saving}>{saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Guardando</> : <><Save className="w-4 h-4 mr-2" />Guardar</>}</Button>
        </div>
      </form>
    </div>
  );
}
// single default export is the function declaration above