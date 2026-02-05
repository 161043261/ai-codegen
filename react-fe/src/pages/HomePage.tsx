import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import AppCard from '@/components/AppCard'
import { useUserStore } from '@/stores/userStore'
import { addApp, listMyAppVoByPage, listGoodAppVoByPage } from '@/api/appController'
import { getDeployUrl } from '@/config/env'

const quickPrompts = [
  {
    label: 'Personal Blog',
    prompt:
      'Create a modern personal blog website with article list, detail page, category tags, search function, comment system, and about page. Use clean design, responsive layout, Markdown support, homepage shows latest and recommended articles.',
  },
  {
    label: 'Corporate Website',
    prompt:
      'Design a professional corporate website with company intro, products/services, news, and contact pages. Business style design with carousel, product cards, team intro, case studies, multi-language support and live chat.',
  },
  {
    label: 'Online Store',
    prompt:
      'Build a complete e-commerce site with product display, shopping cart, user auth, order management, and payment. Modern product cards, search filters, reviews, coupons, and membership points.',
  },
  {
    label: 'Portfolio Website',
    prompt:
      'Create a beautiful portfolio website for designers, photographers, or artists. Include gallery, project details, resume, and contact info. Masonry or grid layout, image preview, and category filtering.',
  },
]

export default function HomePage() {
  const navigate = useNavigate()
  const { loginUser } = useUserStore()
  const [userPrompt, setUserPrompt] = useState('')
  const [creating, setCreating] = useState(false)
  const [myApps, setMyApps] = useState<API.AppVO[]>([])
  const [myAppsPage, setMyAppsPage] = useState({ current: 1, pageSize: 6, total: 0 })
  const [featuredApps, setFeaturedApps] = useState<API.AppVO[]>([])
  const [featuredAppsPage, setFeaturedAppsPage] = useState({ current: 1, pageSize: 6, total: 0 })

  const loadMyApps = async () => {
    if (!loginUser?.id) return
    try {
      const res = await listMyAppVoByPage({
        pageNum: myAppsPage.current,
        pageSize: myAppsPage.pageSize,
        sortField: 'createTime',
        sortOrder: 'desc',
      })
      if (res.data.code === 0 && res.data.data) {
        setMyApps(res.data.data.records || [])
        setMyAppsPage((prev) => ({ ...prev, total: res.data.data?.totalRow || 0 }))
      }
    } catch (error) {
      console.error('Failed to load my apps:', error)
    }
  }

  const loadFeaturedApps = async () => {
    try {
      const res = await listGoodAppVoByPage({
        pageNum: featuredAppsPage.current,
        pageSize: featuredAppsPage.pageSize,
        sortField: 'createTime',
        sortOrder: 'desc',
      })
      if (res.data.code === 0 && res.data.data) {
        setFeaturedApps(res.data.data.records || [])
        setFeaturedAppsPage((prev) => ({ ...prev, total: res.data.data?.totalRow || 0 }))
      }
    } catch (error) {
      console.error('Failed to load featured apps:', error)
    }
  }

  useEffect(() => {
    loadMyApps()
    loadFeaturedApps()
  }, [loginUser?.id])

  const createApp = async () => {
    if (!userPrompt.trim()) {
      toast.warning('Please enter app description')
      return
    }
    if (!loginUser?.id) {
      toast.warning('Please login first')
      navigate('/user/login')
      return
    }

    setCreating(true)
    try {
      const res = await addApp({ initPrompt: userPrompt.trim() })
      if (res.data.code === 0 && res.data.data) {
        toast.success('App created successfully')
        navigate(`/app/chat/${res.data.data}`)
      } else {
        toast.error('Creation failed: ' + res.data.message)
      }
    } catch (error) {
      console.error('Failed to create app:', error)
      toast.error('Creation failed, please retry')
    } finally {
      setCreating(false)
    }
  }

  const viewChat = (appId: string | number | undefined) => {
    if (appId) navigate(`/app/chat/${appId}?view=1`)
  }

  const viewWork = (app: API.AppVO) => {
    if (app.deployKey) {
      window.open(getDeployUrl(app.deployKey), '_blank')
    }
  }

  return (
    <div
      className="w-full min-h-screen relative overflow-hidden"
      style={{
        background: `
          linear-gradient(180deg, #f8fafc 0%, #f1f5f9 8%, #e2e8f0 20%, #cbd5e1 100%),
          radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.12) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(16, 185, 129, 0.08) 0%, transparent 50%)
        `,
      }}
    >
      <div className="max-w-5xl mx-auto px-5 py-5 relative z-10">
        {/* Hero Section */}
        <div className="text-center py-20 mb-7">
          <h1
            className="text-5xl md:text-6xl font-bold mb-5 leading-tight"
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #10b981 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            AI App Generator
          </h1>
          <p className="text-xl text-gray-500">Create website apps with just one sentence</p>
        </div>

        {/* Input Section */}
        <div className="relative max-w-3xl mx-auto mb-6">
          <Textarea
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            placeholder="Help me create a personal blog website"
            rows={4}
            maxLength={1000}
            className="rounded-2xl border-none text-base p-5 pr-16 bg-white/95 backdrop-blur-lg shadow-xl focus:shadow-2xl focus:bg-white transition-all"
          />
          <div className="absolute bottom-3 right-3">
            <Button
              onClick={createApp}
              disabled={creating}
              size="icon"
              className="rounded-full"
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 justify-center mb-16">
          {quickPrompts.map((item) => (
            <Button
              key={item.label}
              variant="outline"
              onClick={() => setUserPrompt(item.prompt)}
              className="rounded-full px-5 py-2 h-auto bg-white/80 backdrop-blur-sm border-blue-200 text-gray-600 hover:bg-white/90 hover:border-blue-400 hover:text-blue-600 hover:-translate-y-0.5 transition-all"
            >
              {item.label}
            </Button>
          ))}
        </div>

        {/* My Apps Section */}
        {loginUser?.id && (
          <section className="mb-16">
            <h2 className="text-3xl font-semibold text-gray-800 mb-8">My Apps</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {myApps.map((app) => (
                <AppCard
                  key={app.id}
                  app={app}
                  onViewChat={viewChat}
                  onViewWork={viewWork}
                />
              ))}
            </div>
            {myApps.length === 0 && (
              <p className="text-center text-gray-400 py-8">No apps yet. Create your first app!</p>
            )}
          </section>
        )}

        {/* Featured Apps Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-gray-800 mb-8">Featured Cases</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {featuredApps.map((app) => (
              <AppCard
                key={app.id}
                app={app}
                featured
                onViewChat={viewChat}
                onViewWork={viewWork}
              />
            ))}
          </div>
          {featuredApps.length === 0 && (
            <p className="text-center text-gray-400 py-8">No featured apps yet.</p>
          )}
        </section>
      </div>
    </div>
  )
}
