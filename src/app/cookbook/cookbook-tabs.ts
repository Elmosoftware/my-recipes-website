/**
 * Tabs in the Cookbook page.
 */
export enum COOKBOOK_TABS {
    MealTypes = "Por platos",
    Levels = "Por niveles de dificultad",
    PublishingOrder = "Últimas publicaciones"
}

/**
 * Parse a string value as a tab name in the Cookbook page.
 * @param tabName Text representation of a COOKBOOK_TABS enumeration item.
 */
export function parseCookbookTab(tabName: string): COOKBOOK_TABS {
    switch (tabName) {
        case COOKBOOK_TABS.MealTypes:
            return COOKBOOK_TABS.MealTypes;
        case COOKBOOK_TABS.Levels:
            return COOKBOOK_TABS.Levels;
        case COOKBOOK_TABS.PublishingOrder:
            return COOKBOOK_TABS.PublishingOrder;
        default:
            throw new Error(`There is no defined CookbookTab with name "${tabName}".`)
    }
}
