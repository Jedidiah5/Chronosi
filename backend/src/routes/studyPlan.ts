import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';

import { query } from '../database/connection.js';
import { setCache, getCache, deleteCache } from '../database/redis.js';
import { logger } from '../utils/logger.js';
import { authenticateToken, requireVerifiedUser } from '../middleware/auth.js';
import { 
  BadRequestError, 
  UnauthorizedError, 
  NotFoundError, 
  ValidationError,
  ForbiddenError 
} from '../middleware/errorHandler.js';

const router = Router();

// Validation middleware
const validateStudyPlan = [
  body('topic')
    .isLength({ min: 1, max: 255 })
    .trim()
    .withMessage('Topic must be 1-255 characters'),
  body('title')
    .optional()
    .isLength({ min: 1, max: 255 })
    .trim()
    .withMessage('Title must be 1-255 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .trim()
    .withMessage('Description must be less than 1000 characters'),
  body('difficultyLevel')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Difficulty level must be beginner, intermediate, or advanced'),
  body('estimatedDurationWeeks')
    .optional()
    .isInt({ min: 1, max: 52 })
    .withMessage('Estimated duration must be 1-52 weeks'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
];

const validateStudyPlanStep = [
  body('title')
    .isLength({ min: 1, max: 255 })
    .trim()
    .withMessage('Step title must be 1-255 characters'),
  body('objective')
    .isLength({ min: 1, max: 1000 })
    .trim()
    .withMessage('Step objective must be 1-1000 characters'),
  body('estimatedTime')
    .optional()
    .isLength({ max: 100 })
    .trim()
    .withMessage('Estimated time must be less than 100 characters'),
  body('orderIndex')
    .isInt({ min: 1 })
    .withMessage('Order index must be a positive integer'),
];

const validateResource = [
  body('type')
    .isLength({ min: 1, max: 50 })
    .trim()
    .withMessage('Resource type must be 1-50 characters'),
  body('title')
    .isLength({ min: 1, max: 255 })
    .trim()
    .withMessage('Resource title must be 1-255 characters'),
  body('link')
    .optional()
    .isURL()
    .withMessage('Resource link must be a valid URL'),
  body('duration')
    .optional()
    .isLength({ max: 50 })
    .trim()
    .withMessage('Duration must be less than 50 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .trim()
    .withMessage('Description must be less than 500 characters'),
  body('orderIndex')
    .isInt({ min: 1 })
    .withMessage('Order index must be a positive integer'),
];

// Create new study plan
router.post('/', authenticateToken, requireVerifiedUser, validateStudyPlan, async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw ValidationError(errors.array()[0].msg);
    }

    const userId = req.user!.id;
    const { topic, title, description, difficultyLevel, estimatedDurationWeeks, isPublic, tags } = req.body;

    // Create study plan
    const planResult = await query(
      `INSERT INTO study_plans (user_id, topic, title, description, difficulty_level, 
                                estimated_duration_weeks, is_public, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, topic, title, description, difficulty_level, estimated_duration_weeks, 
                 is_public, tags, created_at, updated_at`,
      [userId, topic, title, description, difficultyLevel, estimatedDurationWeeks, isPublic || false, tags || []]
    );

    const studyPlan = planResult.rows[0];

    logger.info('Study plan created successfully', {
      userId,
      studyPlanId: studyPlan.id,
      topic: studyPlan.topic,
    });

    res.status(201).json({
      success: true,
      message: 'Study plan created successfully',
      data: {
        studyPlan: {
          id: studyPlan.id,
          topic: studyPlan.topic,
          title: studyPlan.title,
          description: studyPlan.description,
          difficultyLevel: studyPlan.difficulty_level,
          estimatedDurationWeeks: studyPlan.estimated_duration_weeks,
          isPublic: studyPlan.is_public,
          tags: studyPlan.tags,
          createdAt: studyPlan.created_at,
          updatedAt: studyPlan.updated_at,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get all study plans for current user
router.get('/', authenticateToken, requireVerifiedUser, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { status, limit = 20, offset = 0 } = req.query;

    let queryText = `
      SELECT id, topic, title, description, difficulty_level, estimated_duration_weeks, 
             status, is_public, tags, created_at, updated_at
      FROM study_plans 
      WHERE user_id = $1
    `;
    const queryParams = [userId];
    let paramIndex = 1;

    if (status) {
      paramIndex++;
      queryText += ` AND status = $${paramIndex}`;
      queryParams.push(status as string);
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${paramIndex + 1} OFFSET $${paramIndex + 2}`;
    queryParams.push(parseInt(limit as string), parseInt(offset as string));

    const result = await query(queryText, queryParams);

    // Get count for pagination
    const countResult = await query(
      'SELECT COUNT(*) FROM study_plans WHERE user_id = $1',
      [userId]
    );
    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: {
        studyPlans: result.rows.map(row => ({
          id: row.id,
          topic: row.topic,
          title: row.title,
          description: row.description,
          difficultyLevel: row.difficulty_level,
          estimatedDurationWeeks: row.estimated_duration_weeks,
          status: row.status,
          isPublic: row.is_public,
          tags: row.tags,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        })),
        pagination: {
          total: totalCount,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          hasMore: totalCount > parseInt(limit as string) + parseInt(offset as string),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get study plan by ID
router.get('/:id', authenticateToken, requireVerifiedUser, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    // Check cache first
    const cacheKey = `study_plan:${id}`;
    const cachedPlan = await getCache(cacheKey);
    if (cachedPlan) {
      return res.json({
        success: true,
        data: { studyPlan: cachedPlan },
      });
    }

    // Get study plan with steps and resources
    const planResult = await query(
      `SELECT sp.id, sp.topic, sp.title, sp.description, sp.difficulty_level, 
              sp.estimated_duration_weeks, sp.status, sp.is_public, sp.tags, 
              sp.created_at, sp.updated_at
       FROM study_plans sp
       WHERE sp.id = $1 AND (sp.user_id = $2 OR sp.is_public = true)`,
      [id, userId]
    );

    if (planResult.rows.length === 0) {
      throw NotFoundError('Study plan not found');
    }

    const studyPlan = planResult.rows[0];

    // Get steps
    const stepsResult = await query(
      `SELECT id, step_number, title, objective, estimated_time, is_completed, 
              completed_at, order_index, created_at, updated_at
       FROM study_plan_steps 
       WHERE study_plan_id = $1 
       ORDER BY order_index`,
      [id]
    );

    // Get resources for each step
    const stepsWithResources = await Promise.all(
      stepsResult.rows.map(async (step) => {
        const resourcesResult = await query(
          `SELECT id, type, title, link, duration, description, order_index, created_at
           FROM study_plan_resources 
           WHERE step_id = $1 
           ORDER BY order_index`,
          [step.id]
        );

        return {
          id: step.id,
          stepNumber: step.step_number,
          title: step.title,
          objective: step.objective,
          estimatedTime: step.estimated_time,
          isCompleted: step.is_completed,
          completedAt: step.completed_at,
          orderIndex: step.order_index,
          createdAt: step.created_at,
          updatedAt: step.updated_at,
          resources: resourcesResult.rows.map(resource => ({
            id: resource.id,
            type: resource.type,
            title: resource.title,
            link: resource.link,
            duration: resource.duration,
            description: resource.description,
            orderIndex: resource.order_index,
            createdAt: resource.created_at,
          })),
        };
      })
    );

    const completeStudyPlan = {
      id: studyPlan.id,
      topic: studyPlan.topic,
      title: studyPlan.title,
      description: studyPlan.description,
      difficultyLevel: studyPlan.difficulty_level,
      estimatedDurationWeeks: studyPlan.estimated_duration_weeks,
      status: studyPlan.status,
      isPublic: studyPlan.is_public,
      tags: studyPlan.tags,
      createdAt: studyPlan.created_at,
      updatedAt: studyPlan.updated_at,
      steps: stepsWithResources,
    };

    // Cache the result for 5 minutes
    await setCache(cacheKey, completeStudyPlan, 300);

    res.json({
      success: true,
      data: { studyPlan: completeStudyPlan },
    });
  } catch (error) {
    next(error);
  }
});

// Update study plan
router.put('/:id', authenticateToken, requireVerifiedUser, validateStudyPlan, async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw ValidationError(errors.array()[0].msg);
    }

    const userId = req.user!.id;
    const { id } = req.params;
    const { topic, title, description, difficultyLevel, estimatedDurationWeeks, isPublic, tags } = req.body;

    // Check if study plan exists and belongs to user
    const existingPlan = await query(
      'SELECT id FROM study_plans WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existingPlan.rows.length === 0) {
      throw NotFoundError('Study plan not found');
    }

    // Update study plan
    const result = await query(
      `UPDATE study_plans 
       SET topic = $1, title = $2, description = $3, difficulty_level = $4, 
           estimated_duration_weeks = $5, is_public = $6, tags = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 AND user_id = $9
       RETURNING id, topic, title, description, difficulty_level, estimated_duration_weeks, 
                 is_public, tags, created_at, updated_at`,
      [topic, title, description, difficultyLevel, estimatedDurationWeeks, isPublic, tags, id, userId]
    );

    const studyPlan = result.rows[0];

    // Clear cache
    await deleteCache(`study_plan:${id}`);

    logger.info('Study plan updated successfully', {
      userId,
      studyPlanId: studyPlan.id,
      topic: studyPlan.topic,
    });

    res.json({
      success: true,
      message: 'Study plan updated successfully',
      data: {
        studyPlan: {
          id: studyPlan.id,
          topic: studyPlan.topic,
          title: studyPlan.title,
          description: studyPlan.description,
          difficultyLevel: studyPlan.difficulty_level,
          estimatedDurationWeeks: studyPlan.estimated_duration_weeks,
          isPublic: studyPlan.is_public,
          tags: studyPlan.tags,
          createdAt: studyPlan.created_at,
          updatedAt: studyPlan.updated_at,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Delete study plan
router.delete('/:id', authenticateToken, requireVerifiedUser, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    // Check if study plan exists and belongs to user
    const existingPlan = await query(
      'SELECT id FROM study_plans WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existingPlan.rows.length === 0) {
      throw NotFoundError('Study plan not found');
    }

    // Delete study plan (cascade will handle steps and resources)
    await query('DELETE FROM study_plans WHERE id = $1 AND user_id = $2', [id, userId]);

    // Clear cache
    await deleteCache(`study_plan:${id}`);

    logger.info('Study plan deleted successfully', {
      userId,
      studyPlanId: id,
    });

    res.json({
      success: true,
      message: 'Study plan deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Add step to study plan
router.post('/:id/steps', authenticateToken, requireVerifiedUser, validateStudyPlanStep, async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw ValidationError(errors.array()[0].msg);
    }

    const userId = req.user!.id;
    const { id: planId } = req.params;
    const { title, objective, estimatedTime, orderIndex } = req.body;

    // Check if study plan exists and belongs to user
    const existingPlan = await query(
      'SELECT id FROM study_plans WHERE id = $1 AND user_id = $2',
      [planId, userId]
    );

    if (existingPlan.rows.length === 0) {
      throw NotFoundError('Study plan not found');
    }

    // Create step
    const result = await query(
      `INSERT INTO study_plan_steps (study_plan_id, step_number, title, objective, 
                                     estimated_time, order_index)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, step_number, title, objective, estimated_time, order_index, 
                 is_completed, created_at, updated_at`,
      [planId, orderIndex, title, objective, estimatedTime, orderIndex]
    );

    const step = result.rows[0];

    // Clear cache
    await deleteCache(`study_plan:${planId}`);

    logger.info('Study plan step added successfully', {
      userId,
      studyPlanId: planId,
      stepId: step.id,
    });

    res.status(201).json({
      success: true,
      message: 'Step added successfully',
      data: {
        step: {
          id: step.id,
          stepNumber: step.step_number,
          title: step.title,
          objective: step.objective,
          estimatedTime: step.estimated_time,
          orderIndex: step.order_index,
          isCompleted: step.is_completed,
          createdAt: step.created_at,
          updatedAt: step.updated_at,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Add resource to step
router.post('/:id/steps/:stepId/resources', authenticateToken, requireVerifiedUser, validateResource, async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw ValidationError(errors.array()[0].msg);
    }

    const userId = req.user!.id;
    const { id: planId, stepId } = req.params;
    const { type, title, link, duration, description, orderIndex } = req.body;

    // Check if study plan and step exist and belong to user
    const existingStep = await query(
      `SELECT sps.id FROM study_plan_steps sps
       JOIN study_plans sp ON sps.study_plan_id = sp.id
       WHERE sps.id = $1 AND sp.id = $2 AND sp.user_id = $3`,
      [stepId, planId, userId]
    );

    if (existingStep.rows.length === 0) {
      throw NotFoundError('Step not found');
    }

    // Create resource
    const result = await query(
      `INSERT INTO study_plan_resources (step_id, type, title, link, duration, description, order_index)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, type, title, link, duration, description, order_index, created_at`,
      [stepId, type, title, link, duration, description, orderIndex]
    );

    const resource = result.rows[0];

    // Clear cache
    await deleteCache(`study_plan:${planId}`);

    logger.info('Study plan resource added successfully', {
      userId,
      studyPlanId: planId,
      stepId,
      resourceId: resource.id,
    });

    res.status(201).json({
      success: true,
      message: 'Resource added successfully',
      data: {
        resource: {
          id: resource.id,
          type: resource.type,
          title: resource.title,
          link: resource.link,
          duration: resource.duration,
          description: resource.description,
          orderIndex: resource.order_index,
          createdAt: resource.created_at,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;










