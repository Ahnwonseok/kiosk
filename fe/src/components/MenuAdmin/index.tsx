import { useEffect, useMemo, useState } from 'react';
import styles from './menuAdmin.module.css';
import {
  fetchCategoriesWithProducts,
  createCategory,
  updateCategory,
  deleteCategory,
  createProduct,
  updateProduct,
  uploadProductImage,
  deleteProduct,
} from 'api/menu';
import { CategoryInfo, ProductInfo } from 'pages/types';

export default function MenuAdmin() {
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductInfo | null>(null);

  const selectedCategory = useMemo(
    () => categories.find(c => c.categoryId === selectedCategoryId) || null,
    [categories, selectedCategoryId]
  );

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCategoriesWithProducts();
      setCategories(data);
      if (data.length && selectedCategoryId == null) setSelectedCategoryId(data[0].categoryId);
    } catch (e: any) {
      setError(e.message || '목록 조회 실패');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onCreateCategory = async () => {
    const name = prompt('카테고리명 입력');
    if (!name) return;
    await createCategory(name);
    await load();
  };

  const onRenameCategory = async (categoryId: number, oldName: string) => {
    const name = prompt('새 카테고리명 입력', oldName);
    if (!name) return;
    await updateCategory(categoryId, name);
    await load();
  };

  const onDeleteCategory = async (categoryId: number) => {
    if (!window.confirm('카테고리를 삭제하시겠습니까? 해당 카테고리의 메뉴도 모두 삭제됩니다다.')) return;
    await deleteCategory(categoryId);
    await load();
  };

  const onCreateProduct = async () => {
    setShowCreateModal(true);
  };

  const onEditProduct = (product: ProductInfo) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h2>메뉴 관리</h2>        
      </div>
      <button className={`${styles.primary} ${styles.addCategoryBtn}`} onClick={onCreateCategory}>카테고리 추가</button>
      <div className={styles.body}>
        <aside className={styles.sidebar}>
          {loading && <div className={styles.muted}>불러오는 중...</div>}
          {error && <div className={styles.error}>{error}</div>}
          {categories.map(c => (
            <div key={c.categoryId} className={`${styles.cat} ${selectedCategoryId === c.categoryId ? styles.active : ''}`}>
              <button onClick={() => setSelectedCategoryId(c.categoryId)} className={styles.catName}>{c.categoryName}</button>
              <div className={styles.catActions}>
                <button className={styles.primary} onClick={() => onRenameCategory(c.categoryId, c.categoryName)}>수정</button>
                <button className={styles.danger} onClick={() => onDeleteCategory(c.categoryId)}>삭제</button>
              </div>
            </div>
          ))}
        </aside>

        <section className={styles.content}>
          {!selectedCategory && (
            <div className={styles.muted}>카테고리를 선택하세요.</div>
          )}
          {selectedCategory && (
            <div>
              <div className={styles.catHeader}>
                {/* <h3>{selectedCategory.categoryName}</h3> */}
                <button className={styles.primary} onClick={onCreateProduct}>메뉴 추가</button>
              </div>
              <div className={styles.grid}>
                {selectedCategory.products.map(p => (
                  <div key={p.productId} className={styles.card}>
                    <img src={p.imgUrl} alt={p.name} className={styles.thumb} />
                    <div className={styles.title}>{p.name}</div>
                    <div className={styles.meta}>
                      <span>가격: {p.price.toLocaleString()}원</span>
                      <span>온도: {p.hasHot ? 'Hot ' : ''}{p.hasIce ? 'Ice' : ''}</span>
                    </div>
                    <div className={styles.row}>
                      <button className={styles.primary} onClick={() => onEditProduct(p)}>수정</button>
                       <button
                         className={styles.danger}
                         onClick={async () => {
                           if (!window.confirm('이 메뉴를 삭제하시겠습니까?')) return;
                           await deleteProduct(p.productId);
                           await load();
                         }}
                       >
                         삭제
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {showCreateModal && (
        <CreateProductModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={async (form) => {
            if (!selectedCategoryId) return;
            const hasHot = form.temperature === 'hot' || form.temperature === 'both';
            const hasIce = form.temperature === 'ice' || form.temperature === 'both';
            await createProduct({
              categoryId: selectedCategoryId,
              name: form.name,
              price: Number(form.price),
              imgUrl: '',
              hasHot,
              hasIce,
            });
            setShowCreateModal(false);
            await load();
          }}
        />
      )}

      {showEditModal && editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => { setShowEditModal(false); setEditingProduct(null); }}
          onSubmit={async (form, file, defaultImage) => {
            const hasHot = form.temperature === 'hot' || form.temperature === 'both';
            const hasIce = form.temperature === 'ice' || form.temperature === 'both';
            let imgUrl = editingProduct.imgUrl;
            if (file) {
              try {
                const { path } = await uploadProductImage(file);
                imgUrl = path; // e.g., /uploads/filename.png
              } catch (e) {
                alert('이미지 업로드 실패');
              }
            } else if (defaultImage) {
              imgUrl = defaultImage === 'coffee' ? '/assets/image/coffee.png' : '/assets/image/juice.png';
            }
            await updateProduct(editingProduct.productId, {
              name: form.name,
              price: Number(form.price),
              imgUrl,
              hasHot,
              hasIce,
            });
            setShowEditModal(false);
            setEditingProduct(null);
            await load();
          }}
        />
      )}
    </div>
  );
}

type CreateProductForm = {
  name: string;
  price: string; // keep as string for input control
  temperature: 'hot' | 'ice' | 'both';
};

function CreateProductModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (form: CreateProductForm) => void }) {
  const [form, setForm] = useState<CreateProductForm>({ name: '', price: '', temperature: 'both' });
  const isPriceValid = /^\d+$/.test(form.price);
  const canSubmit = form.name.trim().length > 0 && isPriceValid;

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h4>메뉴 추가</h4>
          <button onClick={onClose}>X</button>
        </div>
        <div className={styles.modalBody}>
          <label className={styles.field}>
            <span>메뉴명</span>
            <input
              className={styles.textInput}
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="예: 아메리카노"
            />
          </label>
          <label className={styles.field}>
            <span>가격</span>
            <input
              className={styles.textInput}
              type="text"
              inputMode="numeric"
              value={form.price}
              onChange={(e) => {
                const v = e.target.value;
                if (/^\d*$/.test(v)) setForm({ ...form, price: v });
              }}
              placeholder="숫자만 입력"
            />
          </label>
          <fieldset className={styles.field}>
            <legend>온도</legend>
            <label className={styles.radio}>
              <input
                type="radio"
                name="temperature"
                checked={form.temperature === 'hot'}
                onChange={() => setForm({ ...form, temperature: 'hot' })}
              />
              Hot
            </label>
            <label className={styles.radio}>
              <input
                type="radio"
                name="temperature"
                checked={form.temperature === 'ice'}
                onChange={() => setForm({ ...form, temperature: 'ice' })}
              />
              Ice
            </label>
            <label className={styles.radio}>
              <input
                type="radio"
                name="temperature"
                checked={form.temperature === 'both'}
                onChange={() => setForm({ ...form, temperature: 'both' })}
              />
              Both
            </label>
          </fieldset>
        </div>
        <div className={styles.modalFooter}>
          <button onClick={onClose}>취소</button>
          <button disabled={!canSubmit} className={styles.primary} onClick={() => onSubmit(form)}>추가</button>
        </div>
      </div>
    </div>
  );
}

function EditProductModal({
  product,
  onClose,
  onSubmit,
}: {
  product: ProductInfo;
  onClose: () => void;
  onSubmit: (form: CreateProductForm, file: File | null, defaultImage: 'coffee' | 'juice' | null) => void;
}) {
  const defaultTemp: CreateProductForm['temperature'] = product.hasHot && product.hasIce ? 'both' : product.hasHot ? 'hot' : product.hasIce ? 'ice' : 'both';
  const [form, setForm] = useState<CreateProductForm>({ name: product.name, price: String(product.price), temperature: defaultTemp });
  const [file, setFile] = useState<File | null>(null);
  const [defaultImage, setDefaultImage] = useState<'coffee' | 'juice' | null>(null);
  const isPriceValid = /^\d+$/.test(form.price);
  const canSubmit = form.name.trim().length > 0 && isPriceValid;

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h4>메뉴 수정</h4>
          <button onClick={onClose}>X</button>
        </div>
        <div className={styles.modalBody}>
          <label className={styles.field}>
            <span>메뉴명</span>
            <input
              className={styles.textInput}
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label className={styles.field}>
            <span>이미지 (선택)</span>
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>
          {!file && (
            <fieldset className={styles.field}>
              <legend>기본 이미지</legend>
              <label className={styles.radio}>
                <input
                  type="radio"
                  name="default-image"
                  checked={defaultImage === 'coffee'}
                  onChange={() => setDefaultImage('coffee')}
                />
                커피
              </label>
              <label className={styles.radio}>
                <input
                  type="radio"
                  name="default-image"
                  checked={defaultImage === 'juice'}
                  onChange={() => setDefaultImage('juice')}
                />
                음료
              </label>
            </fieldset>
          )}
          <label className={styles.field}>
            <span>가격</span>
            <input
              className={styles.textInput}
              type="text"
              inputMode="numeric"
              value={form.price}
              onChange={(e) => {
                const v = e.target.value;
                if (/^\d*$/.test(v)) setForm({ ...form, price: v });
              }}
            />
          </label>
          <fieldset className={styles.field}>
            <legend>온도</legend>
            <label className={styles.radio}>
              <input
                type="radio"
                name="temperature-edit"
                checked={form.temperature === 'hot'}
                onChange={() => setForm({ ...form, temperature: 'hot' })}
              />
              Hot
            </label>
            <label className={styles.radio}>
              <input
                type="radio"
                name="temperature-edit"
                checked={form.temperature === 'ice'}
                onChange={() => setForm({ ...form, temperature: 'ice' })}
              />
              Ice
            </label>
            <label className={styles.radio}>
              <input
                type="radio"
                name="temperature-edit"
                checked={form.temperature === 'both'}
                onChange={() => setForm({ ...form, temperature: 'both' })}
              />
              Both
            </label>
          </fieldset>
        </div>
        <div className={styles.modalFooter}>
          <button onClick={onClose}>취소</button>
          <button disabled={!canSubmit} className={styles.primary} onClick={() => onSubmit(form, file, defaultImage)}>저장</button>
        </div>
      </div>
    </div>
  );
}

