import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
    return (
        <div className="flex flex-col h-full">
            <Header title="Settings" />
            <main className="flex-1 p-4 md:p-6 lg:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>This is the settings page. Settings content will go here.</p>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}