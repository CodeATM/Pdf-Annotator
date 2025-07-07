# Annotation Save Feature

## Overview
This feature allows users to save their PDF annotations to the server. When the user clicks the "Save" button in the annotation toolbar, the system will send all current annotations to the backend API.

## Implementation Details

### API Endpoint
- **URL**: `POST http://localhost:2025/api/v1/anon/create-annotation`
- **Request Body**:
```json
{
  "annotations": [
    {
      "fileId": "0hzmxz8",
      "pageNumber": 2,
      "content": "Interesting point here",
      "position": { "x": 120, "y": 220 },
      "type": "comment",
      "color": "#ff9900"
    },
    {
      "fileId": "0hzmxz8",
      "pageNumber": 3,
      "content": "Needs revision",
      "position": { "x": 100, "y": 150 },
      "type": "note"
    }
  ]
}
```

### Components Updated

1. **AnnotationButtons.tsx**: Added save button with proper disabled state
2. **SingleNav.tsx**: Added onSave prop to pass save function
3. **MainSingleFile.tsx**: Added save functionality with error handling and toast notifications
4. **usePdfStore.tsx**: Added saveAnnotationsToServer function that prepares annotation data
5. **types.ts**: Added ApiAnnotation interface for API requests
6. **services/annotations/index.ts**: Created AnnotationService class following existing pattern
7. **hooks/apis/annotations/index.tsx**: Created useCreateAnnotation hook following existing pattern

### Service Pattern

The annotation service follows the same pattern as other services in the codebase:

```typescript
// Service
class AnnotationService {
  createAnnotation({ payload }: { payload: SaveAnnotationRequest }) {
    return instance.post(env.api.annotation + "/create-annotation", payload);
  }
}

// Hook
export const useCreateAnnotation = () => {
  const [loading, setLoading] = useState(false);
  
  const onCreateAnnotation = async ({ payload, successCallback }) => {
    // Implementation with error handling and toast notifications
  };
  
  return { loading, onCreateAnnotation };
};
```

### Features

- **Save Button**: Located in the annotation toolbar, disabled when no annotations exist
- **Error Handling**: Shows error toasts for failed saves
- **Success Feedback**: Shows success toast when annotations are saved
- **Loading State**: Button is disabled during save operation
- **File ID Validation**: Ensures fileId exists before attempting to save
- **Consistent API Pattern**: Follows the same service/hook pattern as other API calls

### Usage

1. Open a PDF file in the annotator
2. Create annotations using highlight, underline, or signature tools
3. Click the "Save" button in the toolbar
4. System will send annotations to the server
5. Success/error message will be displayed

### Error Scenarios

- No fileId found: Shows error toast
- No annotations to save: Button is disabled
- Network error: Shows error toast with details
- Server error: Shows error toast with server message

### Toast Notifications

- **Success**: "Annotations saved successfully"
- **Error**: Various error messages based on failure reason

## Backend Requirements

The backend should expect the request body format shown above and return a response with:
- `success`: boolean
- `message`: string
- `data`: optional additional data

## API Configuration

The annotation endpoint is configured in `src/config/api.ts`:
```typescript
const api = (isProduction: boolean) => ({
  // ... other endpoints
  annotation: `${BASE_URL}/api/v1/anon`,
});
``` 