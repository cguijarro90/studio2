# **App Name**: Biomass Mapper

## Core Features:

- Map Display with Biomass Markers: Display a Google Maps interface with markers indicating biomass source locations.
- Location Filtering and Radius Selection: Allow users to filter biomass sources by location (selecting a point on the map) and radius (setting a kilometer range).
- Biomass Type Filtering: Allow users to filter biomass sources by type (e.g., pellets, carbon, otros) using checkboxes. AI tool will look at new kinds of biomass as options.
- Data Retrieval from BigQuery: Fetch biomass source data from Google BigQuery based on the selected filters and radius.
- Side Panel Display of Results: Display a side panel with paginated results of biomass sources, including name, type, quantity, and distance.
- URL-Based State Persistence: Persist the application state in the URL (query parameters) for deep-linking and refresh.
- Heatmap Overlay: Toggleable heatmap overlay showing density of biomass locations

## Style Guidelines:

- Primary color: Forest green (#388E3C) to represent biomass and nature.
- Background color: Light beige (#F5F5DC) to provide a neutral and clean background.
- Accent color: Earthy brown (#A1887F) for highlighting key elements and calls to action.
- Body and headline font: 'PT Sans', a humanist sans-serif that is modern and warm.
- Use simple, clear icons to represent different biomass types and map controls.
- CSS Grid layout with 70% of the screen dedicated to the map and 30% to the side panel. Side panel is split into 20% for filters and 80% for results.
- Subtle animations for loading states and transitions to improve user experience.