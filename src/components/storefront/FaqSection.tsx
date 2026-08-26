import { RevealOnScroll } from "@/components/storefront/RevealOnScroll";

const FAQS = [
  {
    q: "آیا موجودی سایت واقعی است؟",
    a: "بله. هر محصولی که در سایت مشاهده می‌کنید، عیناً در فروشگاه موجود است. به‌محض اتمام موجودی یک سایز، از سایت نیز حذف می‌شود.",
  },
  {
    q: "چگونه از سایزبندی مطمئن شوم؟",
    a: "برای هر پوشاک، موجودی دقیق هر سایز درج شده و برای کفش و جوراب نیز سایز واقعی موجود ذکر شده است. در صورت تردید، به راهنمای سایز هر محصول مراجعه کنید.",
  },
  {
    q: "آیا تخفیف‌ها همیشگی هستند؟",
    a: "خیر. تخفیف‌ها تنها به تعدادی محدود از محصولات، در بخش «تخفیف‌ها»، تا پایان موجودی همان محصولات اختصاص دارد.",
  },
  {
    q: "شرایط بازگشت کالا چیست؟",
    a: "تمام محصولات دارای ضمانت اصالت (اورجینال بودن) هستند. در صورت وجود مشکل، تا ۲۴ ساعت پس از دریافت کالا امکان بازگشت وجود دارد؛ پس از این مهلت، بازگشت پذیرفته نمی‌شود. برای پذیرش بازگشت، اتیکت و برچسب کالا باید دست‌نخورده و به آن متصل باشد.",
  },
];

export function FaqSection() {
  return (
    <div className="bg-[var(--bg-alt)] px-5 py-[60px]">
      <RevealOnScroll className="max-w-[720px] mx-auto">
        <div className="text-xs tracking-[.1em] font-semibold text-[var(--ink-soft)] mb-7">پرسش‌های متداول</div>
        <div className="flex flex-col">
          {FAQS.map((f, i) => (
            <div key={f.q} className={`py-5 ${i < FAQS.length - 1 ? "border-b border-[var(--line)]" : ""}`}>
              <div className="text-base font-bold mb-2">{f.q}</div>
              <div className="text-[14.5px] leading-[1.9] text-[var(--ink-soft)]">{f.a}</div>
            </div>
          ))}
        </div>
      </RevealOnScroll>
    </div>
  );
}
