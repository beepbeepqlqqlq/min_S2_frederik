import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CalendarDays, ChevronDown, Copy, ExternalLink, MapPin, MessageCircle, X } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { addGuestbookMessage, listGuestbook, submitRsvp } from "@/lib/wedding.functions";
import { supabase } from "@/integrations/supabase/client";
import heroAsset from "@/assets/hero-2.webp.asset.json";
import mapAsset from "@/assets/map.png.asset.json";
import rsvpAsset from "@/assets/RSVP.png.asset.json";
import scheduleAsset from "@/assets/Schedule.png.asset.json";
import dinnerAsset from "@/assets/Dinner.webp.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Min & Frederik 결혼식에 초대합니다" },
    { name: "description", content: "2027년 10월 10일 오후 5시, 서울에서 만나요. Join Min and Frederik in Seoul." },
    { property: "og:title", content: "Min & Frederik — 10.10.2027" },
    { property: "og:description", content: "우리의 결혼식에 초대합니다. You are invited to our wedding in Seoul." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: WeddingPage,
});

const TARGET = new Date("2027-10-10T17:00:00+09:00").getTime();
const postitClasses = ["bg-postit-1", "bg-postit-2", "bg-postit-3", "bg-postit-4", "bg-postit-5", "bg-postit-6"];
const rotations = ["-rotate-1", "rotate-1", "rotate-2", "-rotate-2"];

function BilingualHeading({ ko, en }: { ko: string; en: string }) {
  return <div className="mb-8 text-center"><p className="text-lg font-semibold text-primary">✦ {en.toUpperCase()} ✦</p><h2 className="mt-1 text-lg font-semibold">{ko}</h2></div>;
}
function VintageHeart() {
  return <span aria-hidden="true" className="inline-flex items-center gap-1 text-primary"><span className="h-px w-3 bg-primary/55"/><span className="text-[28px] leading-none">♡</span><span className="h-px w-3 bg-primary/55"/></span>;
}

function SparkleOrnament() {
  return <svg viewBox="0 0 64 24" className="h-6 w-14 overflow-visible" aria-hidden="true">
    <g fill="currentColor">
      <path d="M32 2c.7 5.2 2.8 7.3 8 8-5.2.7-7.3 2.8-8 8-.7-5.2-2.8-7.3-8-8 5.2-.7 7.3-2.8 8-8Z"/>
      <path d="M13 8c.45 3.1 1.7 4.35 4.8 4.8-3.1.45-4.35 1.7-4.8 4.8-.45-3.1-1.7-4.35-4.8-4.8 3.1-.45 4.35-1.7 4.8-4.8Z" opacity=".75"/>
      <path d="M51 8c.45 3.1 1.7 4.35 4.8 4.8-3.1.45-4.35 1.7-4.8 4.8-.45-3.1-1.7-4.35-4.8-4.8 3.1-.45 4.35-1.7 4.8-4.8Z" opacity=".75"/>
    </g>
  </svg>;
}

function StarDivider() { return <div aria-hidden="true" className="flex items-center gap-3 px-12 text-primary"><span className="h-px flex-1 bg-border"/><TrumpetFlower/><span className="h-px flex-1 bg-border"/></div>; }

function WeddingPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hideToday, setHideToday] = useState(false);
  const [now, setNow] = useState(TARGET);
  const queryClient = useQueryClient();
  const fetchMessages = useServerFn(listGuestbook);
  const createMessage = useServerFn(addGuestbookMessage);
  const saveRsvp = useServerFn(submitRsvp);
  const messages = useQuery({ queryKey: ["guestbook"], queryFn: () => fetchMessages() });

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    const today = new Date().toISOString().slice(0, 10);
    const popupTimer = window.setTimeout(() => {
      if (window.localStorage.getItem("wedding-rsvp-hidden") !== today) setDrawerOpen(true);
    }, 2000);
    return () => { window.clearInterval(timer); window.clearTimeout(popupTimer); };
  }, []);

  useEffect(() => {
    const channel = supabase.channel("public-guestbook").on("postgres_changes", { event: "INSERT", schema: "public", table: "guestbook_messages" }, () => {
      queryClient.invalidateQueries({ queryKey: ["guestbook"] });
    }).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [queryClient]);

  const countdown = useMemo(() => {
    const diff = Math.max(0, TARGET - now);
    return { days: Math.floor(diff / 86400000), hours: Math.floor(diff / 3600000) % 24, minutes: Math.floor(diff / 60000) % 60, seconds: Math.floor(diff / 1000) % 60 };
  }, [now]);

  const rsvpMutation = useMutation({ mutationFn: saveRsvp, onSuccess: () => { toast.success("참석 의사가 전달되었습니다. RSVP received."); setDrawerOpen(false); }, onError: () => toast.error("전송하지 못했습니다. Please try again.") });
  const messageMutation = useMutation({ mutationFn: createMessage, onSuccess: (row) => { queryClient.setQueryData(["guestbook"], (current: Awaited<ReturnType<typeof fetchMessages>> | undefined) => current?.some((item) => item.id === row.id) ? current : [row, ...(current ?? [])]); toast.success("메시지가 남겨졌습니다. Message posted."); }, onError: () => toast.error("메시지를 저장하지 못했습니다. Please try again.") });

  function closeDrawer() {
    if (hideToday) window.localStorage.setItem("wedding-rsvp-hidden", new Date().toISOString().slice(0, 10));
    setDrawerOpen(false);
  }

  async function shareWedding() {
    const shareData = { title: "Min & Frederik — 10.10.2027", text: "Min과 Frederik의 결혼식에 초대합니다.", url: window.location.href };
    if (navigator.share) { try { await navigator.share(shareData); return; } catch { return; } }
    await navigator.clipboard.writeText(window.location.href); toast.success("링크를 복사했습니다. Link copied.");
  }

  return <main className="wedding-shell bg-background">
    <section className="relative aspect-[1428/1920] w-full bg-background">
      <img src={heroAsset.url} alt="능소화가 핀 담장 앞에서 함께 웃는 Min과 Frederik" className="h-full w-full object-contain" />
      <a href="#invitation" aria-label="초대장으로 스크롤" className="scroll-bounce absolute bottom-6 left-1/2 -translate-x-1/2 text-primary"><ChevronDown className="size-8"/></a>
    </section>

    <section id="invitation" className="section-pad text-center soft-enter">
      <div className="flex items-center justify-center gap-3 text-lg font-semibold"><span>강민<small className="mt-1 block text-lg font-normal text-muted-foreground">Min Kang</small></span><VintageHeart/><span>프레데릭 랭<small className="mt-1 block text-lg font-normal text-muted-foreground">Frederik Lanng</small></span></div>
    </section>
    <StarDivider />

    <section className="section-pad">
      <BilingualHeading ko="결혼식 날" en="Save the date" />
      <div className="mb-8 text-center"><p className="text-base font-semibold">2027년 10월 10일 일요일 · 오후 5시</p><p className="mt-1 text-base text-muted-foreground">Sunday, October 10, 2027 · 5:00 PM</p></div>
      <Calendar />
      <div className="mt-10 grid grid-cols-4 gap-2 text-center">
        {[[countdown.days,"일","DAYS"],[countdown.hours,"시간","HRS"],[countdown.minutes,"분","MIN"],[countdown.seconds,"초","SEC"]].map(([value,ko,en]) => <div key={en} className="border-y border-border py-4"><strong className="block text-2xl text-primary tabular-nums">{String(value).padStart(2,"0")}</strong><span className="text-[10px] text-muted-foreground">{ko} · {en}</span></div>)}
      </div>
      <p className="mt-7 text-center"><span className="font-medium">Min ❦ Frederik의 결혼식이 {countdown.days}일 남았습니다.</span><br/><span className="text-base text-muted-foreground">{countdown.days} days until Min & Frederik’s wedding.</span></p>
    </section>
    <StarDivider />

    <section className="section-pad">
      <BilingualHeading ko="오시는 길" en="How to get here" />
      <img src={mapAsset.url} alt="아트선재센터까지 오는 길 약도" className="w-full border border-border" />
      <div className="mt-7 flex gap-3">
        <Button asChild className="h-12 flex-1"><a href="https://kko.to/x4Wa2tk9Ff" target="_blank" rel="noreferrer">카카오 맵 · Kakao Map <ExternalLink/></a></Button>
        <Button asChild className="h-12 flex-1"><a href="https://maps.app.goo.gl/oJ8YhbjoMeEfbXGz9" target="_blank" rel="noreferrer">구글 맵 · Google Maps <ExternalLink/></a></Button>
      </div>
      <div className="mt-7 flex gap-3"><MapPin className="mt-1 size-5 shrink-0 text-primary"/><p>서울 종로구 삼청로 22-7<br/><span className="text-sm text-muted-foreground">22-7 Samcheong-ro, Jongno District, Seoul</span></p></div>
    </section>
    <StarDivider />

    <section className="section-pad">
      <BilingualHeading ko="예식 안내" en="Wedding details" />
      <div className="space-y-5">
        <DetailCard image={rsvpAsset.url} alt="RSVP 안내 사진"><p className="details-copy">지정석으로 진행됩니다.<br/>예식 2개월 전까지 참석 여부를 알려주세요.</p><p className="english details-copy">Assigned seating.<br/>Please RSVP at least two months in advance.</p></DetailCard>
        <DetailCard image={scheduleAsset.url} alt="일정과 드레스코드 안내 사진"><p>오후 5–8시 · 결혼식<br/>오후 9시– · 애프터 파티<br/>드레스/정장</p><p className="english">5:00–8:00 PM · Wedding<br/>9:00 PM– · After Party<br/>Cocktail / Formal</p></DetailCard>
        <DetailCard image={dinnerAsset.url} alt="저녁 식사 안내 사진"><p>해산물 & 소고기<br/>식이 제한이 있으신 경우 미리 알려주세요.</p><p className="english">Seafood & Beef<br/>Please let us know of any dietary restrictions.</p></DetailCard>
      </div>
    </section>
    <StarDivider />

    <section className="section-pad text-center">
      <BilingualHeading ko="참석 여부" en="RSVP" />
      <p className="mb-6 text-sm leading-6 text-muted-foreground">자리를 정성껏 준비할 수 있도록 참석 여부를 알려주세요.<br/>Please let us know if you can join us.</p>
      <Button size="lg" className="h-13 w-full" onClick={() => setDrawerOpen(true)}>참석 의사 전달하기 <span className="opacity-80">RSVP</span></Button>
    </section>
    <StarDivider />

    <section className="section-pad">
      <BilingualHeading ko="축하 메시지" en="Guestbook" />
      <GuestbookForm pending={messageMutation.isPending} onSubmit={(data) => messageMutation.mutate({ data })}/>
      <div className="mt-10 columns-2 gap-3 space-y-3">
        {messages.data?.map((message, i) => <article key={message.id} className={`mb-3 break-inside-avoid p-4 text-paper-foreground shadow-sm ${postitClasses[message.color_index] ?? postitClasses[0]} ${rotations[i % rotations.length]}`}><p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p><p className="mt-4 text-xs font-semibold">— {message.author}</p></article>)}
        {!messages.isLoading && !messages.data?.length && <p className="col-span-2 text-center text-sm text-muted-foreground">첫 축하 메시지를 남겨주세요.<br/>Be the first to leave a message.</p>}
      </div>
    </section>

    <footer className="border-t border-border px-6 py-12 text-center">
      <p className="mb-6 text-lg font-medium">Min & Frederik<br/><span className="text-xs font-normal text-muted-foreground">10 · 10 · 2027</span></p>
      <div className="flex justify-center gap-3"><Button variant="secondary" onClick={shareWedding}><MessageCircle/>카카오톡 공유</Button><Button variant="secondary" onClick={async () => { await navigator.clipboard.writeText(window.location.href); toast.success("링크를 복사했습니다. Link copied."); }}><Copy/>링크 복사</Button></div>
      <p className="mt-8 text-[11px] text-muted-foreground">마음으로 함께해 주셔서 감사합니다.<br/>Thank you for celebrating with us.</p>
    </footer>

    <RsvpDrawer open={drawerOpen} onOpenChange={(open) => { if (!open) closeDrawer(); else setDrawerOpen(true); }} hideToday={hideToday} setHideToday={setHideToday} pending={rsvpMutation.isPending} onSubmit={(data) => rsvpMutation.mutate({ data })}/>
    <Toaster position="top-center" richColors />
  </main>;
}

function Calendar() {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  return <div aria-label="2027년 10월 달력" className="mx-auto max-w-sm">
    <div className="mb-5 flex items-center justify-center gap-3"><CalendarDays className="size-4 text-primary"/><span className="font-semibold">2027 · 10</span></div>
    <div className="grid grid-cols-7 gap-y-2 text-center text-xs text-muted-foreground">{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => <span key={d}>{d}</span>)}{Array.from({length:5}).map((_,i)=><span key={`blank-${i}`}/>)}{days.map(day => <span key={day} className={`mx-auto flex size-9 items-center justify-center rounded-full ${day === 10 ? "bg-primary font-bold text-primary-foreground shadow" : "text-foreground"}`}>{day}</span>)}</div>
  </div>;
}
function DetailCard({ image, alt, children }: { image: string; alt: string; children: React.ReactNode }) {
  return <article className="overflow-hidden rounded-md bg-paper text-paper-foreground shadow-lg"><img src={image} alt={alt} className="w-full"/><div className="p-6 text-center [&_p]:text-base [&_p]:leading-7 [&_.english]:mt-3 [&_.english]:opacity-70">{children}</div></article>;
}

function GuestbookForm({ pending, onSubmit }: { pending: boolean; onSubmit: (data: { author: string; content: string }) => void }) {
  const [author, setAuthor] = useState(""); const [content, setContent] = useState(""); const [error, setError] = useState("");
  function submit(e: FormEvent) { e.preventDefault(); if (!author.trim() || !content.trim()) { setError("이름과 메시지를 모두 입력해주세요. Please complete both fields."); return; } onSubmit({ author: author.trim(), content: content.trim() }); setAuthor(""); setContent(""); setError(""); }
  return <form onSubmit={submit} className="space-y-3"><Input value={author} onChange={e=>setAuthor(e.target.value)} maxLength={60} placeholder="이름 · Name" aria-label="이름 Name"/><Textarea value={content} onChange={e=>setContent(e.target.value)} maxLength={500} placeholder="축하 메시지를 남겨주세요 · Leave a message" aria-label="축하 메시지 Message" className="min-h-28"/>{error && <p className="text-xs text-primary">{error}</p>}<Button disabled={pending} className="w-full">{pending ? "저장 중… Saving…" : "메시지 남기기 · Post message"}</Button></form>;
}

type RsvpData = { name: string; email: string | null; attendance: boolean; guestCount: number; guestName: string | null; guestSide: "min" | "frederik" };
function RsvpDrawer({ open, onOpenChange, hideToday, setHideToday, pending, onSubmit }: { open: boolean; onOpenChange: (open:boolean)=>void; hideToday:boolean; setHideToday:(v:boolean)=>void; pending:boolean; onSubmit:(data:RsvpData)=>void }) {
  const [side,setSide]=useState<"min"|"frederik">("min"); const [attendance,setAttendance]=useState(true); const [name,setName]=useState(""); const [email,setEmail]=useState(""); const [plusOne,setPlusOne]=useState(false); const [guestName,setGuestName]=useState(""); const [error,setError]=useState("");
  function submit(e:FormEvent){ e.preventDefault(); if(!name.trim()){setError("성함을 입력해주세요. Please enter your name.");return;} if(email.trim()&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())){setError("이메일 주소를 확인해주세요. Please check your email address.");return;} if(plusOne&&!guestName.trim()){setError("동반인 이름을 입력하거나 N/A를 눌러주세요. Add a guest name or choose N/A.");return;} setError(""); onSubmit({name:name.trim(),email:email.trim()||null,attendance,guestCount:plusOne?1:0,guestName:plusOne?guestName.trim():null,guestSide:side}); }
  return <Drawer open={open} onOpenChange={onOpenChange} shouldScaleBackground={false}><DrawerContent className="left-1/2 max-h-[92vh] w-full max-w-[480px] -translate-x-1/2 border-border bg-paper text-paper-foreground"><div className="overflow-y-auto px-6 pb-8"><DrawerHeader className="relative px-0 pt-3 text-left"><DrawerClose asChild><Button variant="ghost" size="icon" className="absolute right-0 top-0 text-primary" aria-label="닫기"><X/></Button></DrawerClose><DrawerTitle className="text-2xl">참석 여부 · RSVP</DrawerTitle><DrawerDescription>예식 준비를 위해 아래 내용을 알려주세요.<br/>Please share your attendance details.</DrawerDescription></DrawerHeader>
    <form onSubmit={submit} className="mt-5 space-y-5">
      <FieldLabel ko="구분" en="Guest of"><div className="grid grid-cols-2 gap-2"><Choice active={side==="min"} onClick={()=>setSide("min")}>신부측<br/><small>Min</small></Choice><Choice active={side==="frederik"} onClick={()=>setSide("frederik")}>신랑측<br/><small>Frederik</small></Choice></div></FieldLabel>
      <FieldLabel ko="참석 여부" en="Attendance"><div className="grid grid-cols-2 gap-2"><Choice active={attendance} onClick={()=>setAttendance(true)}>참석<br/><small>Joyfully Accept</small></Choice><Choice active={!attendance} onClick={()=>setAttendance(false)}>불참석<br/><small>Regretfully Decline</small></Choice></div></FieldLabel>
      <FieldLabel ko="성함" en="Name"><Input value={name} onChange={e=>setName(e.target.value)} maxLength={100} placeholder="성함 · Full name" className="border-input bg-paper"/></FieldLabel>
      <FieldLabel ko="이메일 주소" en="Email address"><Input value={email} onChange={e=>setEmail(e.target.value)} maxLength={254} inputMode="email" type="email" placeholder="name@example.com" className="border-input bg-paper"/></FieldLabel>
      {attendance && <FieldLabel ko="동반인" en="Plus one"><div className="mb-2 grid grid-cols-2 gap-2"><Choice active={!plusOne} onClick={()=>{setPlusOne(false);setGuestName("");}}>N/A<br/><small>동반인 없음</small></Choice><Choice active={plusOne} onClick={()=>setPlusOne(true)}>동반인 있음<br/><small>Bringing a guest</small></Choice></div>{plusOne&&<Input value={guestName} onChange={e=>setGuestName(e.target.value)} maxLength={100} placeholder="동반인 이름 · Name of the guest" className="border-input bg-paper"/>}</FieldLabel>}
      {error&&<p className="text-xs font-medium text-primary">{error}</p>}<Button disabled={pending} className="h-12 w-full">{pending?"전달 중… Submitting…":"참석 의사 전달하기 · Submit"}</Button>
      <label className="flex cursor-pointer items-center justify-center gap-2 text-xs text-paper-foreground/65"><Checkbox checked={hideToday} onCheckedChange={v=>setHideToday(v===true)}/>오늘 하루 보지 않기 · Don’t show again today</label>
    </form></div></DrawerContent></Drawer>;
}
function FieldLabel({ko,en,children}:{ko:string;en:string;children:React.ReactNode}){return <div><p className="mb-2 text-sm font-semibold">{ko} <span className="font-normal opacity-55">{en}</span></p>{children}</div>}
function Choice({active,onClick,children}:{active:boolean;onClick:()=>void;children:React.ReactNode}){return <Button type="button" variant={active?"default":"outline"} className="h-14 whitespace-normal leading-4" onClick={onClick}>{children}</Button>}
