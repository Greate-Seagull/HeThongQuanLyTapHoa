import { Router } from "express";
import { controller } from "../controllers/controller";
import { authenticationMiddleware } from "../middlewares/authentication.middleware";
import { authorizationMiddleware } from "../middlewares/authorization.middleware";

export function reportRouter(dependencies: {
	getInventoryReportUsecase: any;
	getGoodsReceiptReportUsecase: any;
	getSalesReportUsecase: any;
	getCustomerReportUsecase: any;
	getStocktakingReportUsecase: any;
	getRevenueProfitReportUsecase: any;
}) {
	const router = Router();

	// Báo cáo tồn kho
	router.get(
		"/inventory",
		authenticationMiddleware,
		authorizationMiddleware("MANAGER"),
		controller(dependencies.getInventoryReportUsecase)
	);

	// Báo cáo nhập hàng
	router.get(
		"/goods-receipt",
		authenticationMiddleware,
		authorizationMiddleware("MANAGER"),
		controller(dependencies.getGoodsReceiptReportUsecase)
	);

	// Báo cáo bán hàng
	router.get(
		"/sales",
		authenticationMiddleware,
		authorizationMiddleware("MANAGER"),
		controller(dependencies.getSalesReportUsecase)
	);

	// Báo cáo khách hàng
	router.get(
		"/customer",
		authenticationMiddleware,
		authorizationMiddleware("MANAGER"),
		controller(dependencies.getCustomerReportUsecase)
	);

	// Báo cáo kiểm kê
	router.get(
		"/stocktaking",
		authenticationMiddleware,
		authorizationMiddleware("MANAGER"),
		controller(dependencies.getStocktakingReportUsecase)
	);

	// Báo cáo doanh thu/lợi nhuận
	router.get(
		"/revenue-profit",
		authenticationMiddleware,
		authorizationMiddleware("MANAGER"),
		controller(dependencies.getRevenueProfitReportUsecase)
	);

	return router;
}
