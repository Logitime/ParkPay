import { Header } from "@/components/layout/Header";
import { GateControl } from "@/components/dashboard/GateControl";

export default function GatesPage() {
    return (
        <div className="flex flex-col h-full">
            <Header title="Gate Control" />
            <main className="flex-1 p-4 md:p-6 lg:p-8">
                <GateControl />
            </main>
        </div>
    )
}
