import { Award, FolderTree, Image, Package, ArrowRight, LayoutDashboard, Sparkles, TrendingUp } from 'lucide-react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '~/core/components/shadcn/button'
import { Badge } from '~/core/components/shadcn/badge'
import { useAuthStore } from '~/stores'

export default function DashboardPage() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)

  const quickLinks = [
    {
      title: t('label.manageCategory'),
      description: 'Organize products with hierarchical categories',
      url: '/admin/manage-category',
      icon: FolderTree,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10'
    },
    {
      title: t('label.manageBrand'),
      description: 'Manage manufacturer brands and product lines',
      url: '/admin/manage-brand',
      icon: Award,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500/10'
    },
    {
      title: t('label.manageProduct'),
      description: 'Create, update and organize store inventory',
      url: '/admin/manage-product',
      icon: Package,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-500/10'
    },
    {
      title: t('label.manageMedia'),
      description: 'Upload and manage media gallery assets',
      url: '/admin/manage-media',
      icon: Image,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-500/10'
    }
  ]

  return (
    <div className='w-full min-h-screen bg-gray-50/50 dark:bg-zinc-950 p-6 space-y-8'>
      {/* Welcome Banner */}
      <div className='relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 p-8 text-white shadow-lg'>
        <div className='relative z-10 max-w-2xl space-y-3'>
          <div className='inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur'>
            <Sparkles className='size-3.5 text-amber-400' />
            <span>Admin Overview</span>
          </div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Welcome back, {user?.name || 'Administrator'}!
          </h1>
          <p className='text-zinc-300 text-sm leading-relaxed'>
            Manage your store's products, brands, categories, and media assets with the admin management tools below.
          </p>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2'>
            <LayoutDashboard className='size-5 text-primary' />
            Quick Management
          </h2>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          {quickLinks.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.url}
                to={item.url}
                className='group relative flex flex-col justify-between p-5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-2xs hover:shadow-md hover:border-primary/40 transition-all duration-200'
              >
                <div className='space-y-3'>
                  <div className={`w-10 h-10 rounded-lg ${item.bg} ${item.color} flex items-center justify-center`}>
                    <Icon className='size-5' />
                  </div>
                  <div>
                    <h3 className='font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors'>
                      {item.title}
                    </h3>
                    <p className='text-xs text-muted-foreground mt-1 leading-relaxed'>
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className='mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-xs font-medium text-primary'>
                  <span>Access module</span>
                  <ArrowRight className='size-3.5 transition-transform group-hover:translate-x-1' />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
