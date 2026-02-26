import { CategoriesProvider } from "@/contexts/CategoriesContext";
import { EventsProvider } from "@/contexts/EventsContext";
import { InscriptionsProvider } from "@/contexts/InscriptionsContext";
import { LoginProvider } from "@/contexts/LoginContext";
import { UsersProvider } from "@/contexts/UsersContext";


export default function Providers({ children }) {
    return (
        <LoginProvider>
            <UsersProvider>
                <CategoriesProvider>
                    <EventsProvider>
                        <InscriptionsProvider>
                            {children}
                        </InscriptionsProvider>
                    </EventsProvider>
                </CategoriesProvider>
            </UsersProvider>
        </LoginProvider>
    );
}