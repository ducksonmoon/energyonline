"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deleteProduct } from "@/app/admin/(dashboard)/products/actions";

export function DeleteProductButton({ productId, productName }: { productId: string; productName: string }) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`محصول «${productName}» حذف بشه؟ این کار قابل بازگشت نیست.`)) return;
    startTransition(() => {
      deleteProduct(productId);
    });
  }

  return (
    <Button type="button" variant="ghost" size="sm" onClick={handleDelete} disabled={pending}>
      {pending ? "..." : "حذف"}
    </Button>
  );
}
