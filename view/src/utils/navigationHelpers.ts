import { CommonActions, NavigationProp } from '@react-navigation/native';

// Screens that live inside the HomeStack (stack nested under Home/HomeTab tabs)
const HOME_STACK_SCREENS = new Set([
    'Home',
    'BookingSuccessScreen',
    'SmilePreview',
    'BiteTypeVideosScreen',
    'TeethWhiteningScreen',
    'TermsAndConditionsScreen',
    'LoginScreen',
    'TeethAlignmentProblems',
    'ShowAllBlogsScreen',
    'PaymentScreen',
    'MyDentCoinsScreen',
    'NewTicketScreen',
    'CancelTicketScreen',
    'ConsultationDetailsScreen',
    'ConsultationBookedScreen',
    'CartScreen',
    'BlogScreen',
    'Profile',
    'ContactUs',
    'ConsultationOption',
    'AgeSelection',
    'TeethIssueSelection',
    'ProblemDetail',
    'Centers',
    'MedicalHistory',
    'GenderSelection',
    'SmokingStatus',
    'Availability',
    'CheckoutSummary',
    'EComScreen',
    'AlignersForTeensScreen',
    'MyDentAlignersScreen',
    'ProductDetailScreen',
    'TeethTreatmentScreen',
    'TransformationScreen',
    'TransformationBlogDetailsScreen',
    'ClinicMap',
    'TreatmentInfoScreen',
    'FindBiteTypeScreen',
    'FavProductScreen',
    'FormExample',
    'AppConfig'
]);

// Tab names that host HomeStack variants
const HOME_TABS = ['HomeTab', 'Home'];

// Re-export original normalize to consolidate under one file
export function normalizeScreenName(name?: string): string | undefined {
    if (!name) return undefined;
    if (name === 'Centers') return 'CentersTab';
    return name;
}

interface NavigateOptions {
    params?: Record<string, any>;
    // If provided, force using a specific tab as parent
    parentTab?: string;
}

export function navigateToScreen(
    navigation: NavigationProp<Record<string, object | undefined>>,
    screenName: string,
    { params, parentTab }: NavigateOptions = {}
) {
    if (!screenName) return;

    // Normalize legacy or API-provided names
    screenName = normalizeScreenName(screenName) || screenName;

    // PaymentScreen must always be reached through a Home stack host
    if (screenName === 'PaymentScreen') {
        const host = parentTab && HOME_TABS.includes(parentTab) ? parentTab : 'HomeTab';
        navigation.navigate(host as any, { screen: 'PaymentScreen', params } as any);
        return;
    }

    // If the target is a Home stack screen and we are not already inside it (best effort), nest under HomeTab
    // We try a conservative approach: always route via HomeTab for known stack screens except where the tab itself matches.
    if (HOME_STACK_SCREENS.has(screenName) && !HOME_TABS.includes(screenName)) {
        navigation.navigate('HomeTab' as any, { screen: screenName, params } as any);
        return;
    }

    // Fallback: attempt direct navigation (works if current navigator hosts the route)
    try {
        navigation.navigate(screenName as any, params as any);
    } catch (e) {
        // Final fallback: push through HomeTab
        navigation.navigate('HomeTab' as any, { screen: screenName, params } as any);
    }
}

export function resetToLogin(navigation: NavigationProp<any>) {
    const resetAction = CommonActions.reset({
        index: 0,
        routes: [{ name: 'LoginScreen' }],
    });
    try {
        navigation.dispatch(resetAction);
    } catch {
        const legacyReset = CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] });
        navigation.dispatch(legacyReset);
    }
}
