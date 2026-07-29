import { Router } from 'express';
import { findAllRegions, findRegionById } from './region.repository';
import { mapRegionToResponse } from './region.mapper';
import { AppError } from '../../common/errors/AppError';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const stateCode = typeof req.query.stateCode === 'string' ? req.query.stateCode : undefined;
    const languageCode = typeof req.query.languageCode === 'string' ? req.query.languageCode : undefined;
    const regions = await findAllRegions(stateCode, languageCode);
    res.json({ success: true, data: regions.map(mapRegionToResponse) });
  } catch (error) {
    next(error);
  }
});

router.get('/:regionId', async (req, res, next) => {
  try {
    const region = await findRegionById(req.params.regionId);
    if (!region) {
      throw new AppError(404, 'REGION_NOT_FOUND', 'Coastal region not found');
    }
    res.json({ success: true, data: mapRegionToResponse(region) });
  } catch (error) {
    next(error);
  }
});

export default router;
