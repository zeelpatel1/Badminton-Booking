import { ReactNode } from "react"
import ProtectedAdmin from "@/component/ProtectedAdmin"
import { SimpleHeader } from "@/components/simple-header"

export default function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <ProtectedAdmin>
      <div className="min-h-screen">
        <SimpleHeader role="Admin" />
        <main className="p-6">{children}</main>
      </div>
    </ProtectedAdmin>
  )
}
