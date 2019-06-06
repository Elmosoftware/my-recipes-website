/**
 * Tabs in the Recipe page.
 */
export enum RECIPE_TABS {
    Details = "Detalles",
    Ingredients = "Ingredientes",
    Directions = "Preparación",
    Photos = "Fotos",
    Publishing = "Publicación",
    Finish = "Finalizar!"
}

/**
 * Parse a string value as a tab name in the Recipe page.
 * @param tabName Text representation of a RECIPE_TABS enumeration item.
 */
export function parseRecipeTab(tabName: string): RECIPE_TABS {
    switch (tabName) {
        case RECIPE_TABS.Details:
            return RECIPE_TABS.Details;
        case RECIPE_TABS.Ingredients:
            return RECIPE_TABS.Ingredients;
        case RECIPE_TABS.Directions:
            return RECIPE_TABS.Directions;
        case RECIPE_TABS.Photos:
            return RECIPE_TABS.Photos;
        case RECIPE_TABS.Publishing:
            return RECIPE_TABS.Publishing;
        case RECIPE_TABS.Finish:
            return RECIPE_TABS.Finish;
        default:
            throw new Error(`There is no defined RecipeTab with name "${tabName}".`)
    }
}
