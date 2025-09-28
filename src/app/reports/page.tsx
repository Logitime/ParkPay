import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportsPage() {
    return (
        <div className="flex flex-col h-full">
            <Header title="Reports" />
            <main className="flex-1 p-4 md:p-6 lg:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Reports</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>This is the reports page. Reports content will go here.</p>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}