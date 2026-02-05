import { Outlet } from 'react-router'
import GlobalHeader from '@/components/GlobalHeader'
import GlobalFooter from '@/components/GlobalFooter'

export default function BasicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <GlobalHeader />
      <main className="flex-1 w-full p-0 m-0 bg-transparent">
        <Outlet />
      </main>
      <GlobalFooter />
    </div>
  )
}
