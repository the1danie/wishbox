"use client";
import Link from "next/link";
import { Gift, Users, Zap, Lock, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store";

export default function LandingPage() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Navbar */}
      <nav className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎁</span>
          <span className="font-bold text-xl text-gray-900">WishBox</span>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <Link href="/dashboard">
              <Button>Мои вишлисты</Button>
            </Link>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost">Войти</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Начать бесплатно</Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 pt-16 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
          <Star className="w-3.5 h-3.5 fill-current" />
          Без испорченных сюрпризов
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
          Вишлист, который
          <br />
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            работает как надо
          </span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Создай список желаний, поделись с друзьями. Они резервируют подарки и скидываются —
          а ты узнаешь о подарках только когда получишь их.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={user ? "/dashboard" : "/auth/register"}>
            <Button size="lg" className="gap-2 text-base px-8 h-12">
              Создать вишлист
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 pb-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              icon: <Gift className="w-5 h-5" />,
              title: "Любой повод",
              desc: "День рождения, Новый год, свадьба — создавай вишлисты для любого события",
              color: "bg-purple-100 text-purple-600",
            },
            {
              icon: <Lock className="w-5 h-5" />,
              title: "Тайна сохранена",
              desc: "Ты не видишь, кто что зарезервировал. Сюрприз остаётся сюрпризом",
              color: "bg-pink-100 text-pink-600",
            },
            {
              icon: <Users className="w-5 h-5" />,
              title: "Групповые сборы",
              desc: "Дорогой подарок? Друзья могут скинуться. Прогресс-бар покажет сколько собрали",
              color: "bg-orange-100 text-orange-600",
            },
            {
              icon: <Zap className="w-5 h-5" />,
              title: "Реалтайм",
              desc: "Когда кто-то резервирует подарок — все видят это мгновенно, без перезагрузки",
              color: "bg-green-100 text-green-600",
            },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                {f.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 pb-24">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Как это работает</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: "1", title: "Создай вишлист", desc: "Добавь желания — вставь ссылку, и мы сами подтянем название, цену и картинку" },
            { step: "2", title: "Поделись ссылкой", desc: "Отправь ссылку друзьям. Они видят вишлист без регистрации" },
            { step: "3", title: "Получай подарки", desc: "Друзья резервируют и скидываются. Ты не знаешь детали — только радуешься подаркам" },
          ].map((s) => (
            <div key={s.step} className="text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold text-xl flex items-center justify-center mx-auto mb-4">
                {s.step}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 py-16 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Готов попробовать?</h2>
        <p className="text-purple-100 mb-8">Создай первый вишлист за 2 минуты. Бесплатно.</p>
        <Link href={user ? "/dashboard" : "/auth/register"}>
          <Button size="lg" variant="secondary" className="gap-2 text-base px-8 h-12">
            Начать бесплатно
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </section>

      <footer className="text-center py-8 text-sm text-gray-400">
        © 2024 WishBox
      </footer>
    </div>
  );
}
