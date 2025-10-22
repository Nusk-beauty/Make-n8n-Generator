// backend/src/middleware/validators.js
const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const clienteValidationRules = () => {
  return [
    body('nombre').notEmpty().withMessage('El nombre es requerido').trim().escape(),
    body('email').isEmail().withMessage('Debe ser un email válido').normalizeEmail(),
    body('telefono').optional({ checkFalsy: true }).isString().trim().escape(),
    body('nacimiento').optional({ checkFalsy: true }).isISO8601().toDate(),
    body('sexo').isIn(['Hombre', 'Mujer']).withMessage('Sexo debe ser Hombre o Mujer'),
    body('estatura').isNumeric().withMessage('Estatura debe ser un número'),
    body('peso').isNumeric().withMessage('Peso debe ser un número'),
    body('objetivo').notEmpty().withMessage('El objetivo es requerido').trim().escape(),
    body('nivel').notEmpty().withMessage('El nivel es requerido').trim().escape(),
    body('dias').isNumeric().withMessage('Días debe ser un número'),
    body('equipo').optional({ checkFalsy: true }).isString().trim().escape(),
    body('preferencias').optional({ checkFalsy: true }).isString().trim().escape(),
    body('alergias').optional({ checkFalsy: true }).isString().trim().escape(),
    body('patologias').optional({ checkFalsy: true }).isString().trim().escape(),
    body('historial').optional({ checkFalsy: true }).isString().trim().escape(),
    body('notas').optional({ checkFalsy: true }).isString().trim().escape(),
  ];
};

const planValidationRules = () => {
  return [
    body('cliente').isObject().withMessage('El objeto cliente es requerido'),
    body('cliente.nombre').notEmpty().withMessage('El nombre del cliente es requerido'),
    body('dias').optional().isInt({ min: 1, max: 30 }).withMessage('Días debe ser un entero entre 1 y 30'),
    body('enfoque').optional().isString(),
    body('enviarEmail').optional().isBoolean(),
    body('chartsBase64').optional().isString(),
  ];
};

const reportValidationRules = () => {
    return [
      body('cliente').isObject().withMessage('El objeto cliente es requerido'),
      body('plan').isObject().withMessage('El objeto plan es requerido'),
      body('chartsBase64').optional().isString(),
    ];
};

const fatCalcValidationRules = () => {
    return [
        body('sexo').isIn(['Hombre', 'Mujer']).withMessage('Sexo debe ser Hombre o Mujer'),
        body('estatura').isNumeric().withMessage('Estatura debe ser un número'),
        body('cuello').isNumeric().withMessage('Medida de cuello debe ser un número'),
        body('cintura').isNumeric().withMessage('Medida de cintura debe ser un número'),
        body('cadera').optional({ checkFalsy: true }).isNumeric().withMessage('Medida de cadera debe ser un número'),
    ];
};


module.exports = {
  clienteValidationRules,
  planValidationRules,
  reportValidationRules,
  fatCalcValidationRules,
  handleValidationErrors,
};