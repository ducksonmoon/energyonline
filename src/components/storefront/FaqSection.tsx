import { RevealOnScroll } from "@/components/storefront/RevealOnScroll";

const FAQS = [
  {
    q: "موجودی سایت واقعیه؟",
    a: "بله. هرچی این‌جا می‌بینید همون چیزیه که الان روی رگال فروشگاهه. وقتی یه سایز تموم بشه، از سایت هم برداشته می‌شه.",
  },
  {
    q: "سایزبندی رو از کجا مطمئن بشم؟",
    a: "برای هر لباس تعداد دقیق هر سایز رو نوشتیم، و برای کفش و جوراب هم سایز واقعی موجود درج شده. اگه مطمئن نیستید، راهنمای سایز هر محصول رو ببینید.",
  },
  {
    q: "تخفیف‌ها همیشه هستن؟",
    a: "نه، فقط روی چندتا تیکه که تو بخش «تخفیف‌ها» مشخص شدن، اونم تا وقتی موجودیشون تموم بشه.",
  },
];

export function FaqSection() {
  return (
    <div className="bg-[var(--bg-alt)] px-5 py-[60px]">
      <RevealOnScroll className="max-w-[720px] mx-auto">
        <div className="text-xs tracking-[.1em] font-semibold text-[var(--ink-soft)] mb-7">چند نکته</div>
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
