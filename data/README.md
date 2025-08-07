# Course Content Management

This directory contains all the course content for CyberPup in a structured, maintainable format.

## File Structure

- `courseData.js` - Main data file containing all categories, modules, and lessons
- `README.md` - This documentation file

## Data Structure

### Categories
Each category represents a major security topic:
- Password Security & Authentication
- Phishing & Scam Awareness  
- Device & Network Security
- Online Privacy & Social Media
- Secure Finances & Identity Protection

### Modules
Each category contains 4 modules. Each module has:
- `id` - Unique identifier (e.g., '1-1')
- `title` - Module title
- `description` - Brief description
- `duration` - Estimated completion time
- `lessons` - Number of lessons in the module
- `categoryId` - Reference to parent category

### Lessons
Each module contains 2-5 lessons. Each lesson has:
- `id` - Unique identifier (e.g., '1-1-1')
- `title` - Lesson title
- `content` - The actual lesson content
- `type` - Lesson type: 'instruction', 'exercise', or 'checklist'

## How to Update Content

### Adding a New Lesson
1. Open `courseData.js`
2. Find the appropriate module in the `lessons` object
3. Add a new lesson object with the required fields:

```javascript
{
  id: 'module-id-lesson-number',
  title: 'Your Lesson Title',
  content: 'Your lesson content here...',
  type: 'instruction', // or 'exercise' or 'checklist'
}
```

### Modifying Existing Content
1. Open `courseData.js`
2. Find the lesson you want to modify
3. Update the `title`, `content`, or `type` as needed
4. Save the file

### Adding a New Module
1. Add the module to the appropriate category in the `modules` object
2. Add the corresponding lessons to the `lessons` object
3. Update the module count in the category if needed

## Helper Functions

The `courseData.js` file includes helper functions for easy data access:

- `getCategoryById(id)` - Get a category by ID
- `getModulesByCategory(categoryId)` - Get all modules for a category
- `getLessonsByModule(moduleId)` - Get all lessons for a module
- `getAllModules()` - Get all modules across all categories
- `getAllLessons()` - Get all lessons across all modules
- `searchContent(query)` - Search across all content

## Best Practices

1. **Keep IDs consistent** - Use the format `category-module-lesson` (e.g., '1-2-3')
2. **Update lesson counts** - When adding/removing lessons, update the `lessons` count in the module
3. **Test changes** - After making changes, test the app to ensure everything works correctly
4. **Backup content** - Consider backing up your content before making major changes
5. **Use descriptive titles** - Make lesson titles clear and descriptive

## Content Guidelines

### Lesson Types
- **instruction** - Educational content explaining concepts
- **exercise** - Hands-on practice activities
- **checklist** - Review and verification steps

### Content Tips
- Keep content concise but comprehensive
- Use clear, simple language
- Include practical examples
- End exercises with actionable steps
- Use checklists for important security practices

## Troubleshooting

If you encounter issues after updating content:

1. Check that all IDs are unique and properly formatted
2. Verify that module IDs in the `lessons` object match those in the `modules` object
3. Ensure all required fields are present for each lesson
4. Test the app to make sure navigation and progress tracking still work

## Future Enhancements

Consider these potential improvements:
- Separate content into multiple files for easier management
- Add support for rich media (images, videos)
- Implement content versioning
- Add content validation scripts
- Create a content management interface 