export interface ApiResponse<T> {
    data?: T;
    error?: string;
    meta?: {
        total: number;
        page: number;
        limit: number;
    };
}

export interface Customer {
    CustomerID: string;
    CompanyName: string;
    ContactName: string | null;
    ContactTitle: string | null;
    Address: string | null;
    City: string | null;
    Region: string | null;
    PostalCode: string | null;
    Country: string | null;
    Phone: string | null;
    Fax: string | null;
}

export interface Product {
    ProductID: number;
    ProductName: string;
    SupplierID: number | null;
    CategoryID: number | null;
    QuantityPerUnit: string | null;
    UnitPrice: number | null;
    UnitsInStock: number | null;
    UnitsOnOrder: number | null;
    ReorderLevel: number | null;
    Discontinued: number;
    category?: Category | null;
    supplier?: Supplier | null;
}

export interface Order {
    OrderID: number;
    CustomerID: string | null;
    EmployeeID: number | null;
    OrderDate: string | null;
    RequiredDate: string | null;
    ShippedDate: string | null;
    ShipVia: number | null;
    Freight: number | null;
    ShipName: string | null;
    ShipAddress: string | null;
    ShipCity: string | null;
    ShipRegion: string | null;
    ShipPostalCode: string | null;
    ShipCountry: string | null;
    customer?: Customer | null;
    employee?: Employee | null;
    shipper?: Shipper | null;
    order_details?: OrderDetail[];
}

export interface OrderDetail {
    OrderID: number;
    ProductID: number;
    UnitPrice: number;
    Quantity: number;
    Discount: number;
    product?: Product;
}

export interface Employee {
    EmployeeID: number;
    LastName: string;
    FirstName: string;
    Title: string | null;
    TitleOfCourtesy: string | null;
    BirthDate: string | null;
    HireDate: string | null;
    Address: string | null;
    City: string | null;
    Region: string | null;
    PostalCode: string | null;
    Country: string | null;
    HomePhone: string | null;
    Extension: string | null;
    Notes: string | null;
    ReportsTo: number | null;
}

export interface Supplier {
    SupplierID: number;
    CompanyName: string;
    ContactName: string | null;
    ContactTitle: string | null;
    Address: string | null;
    City: string | null;
    Region: string | null;
    PostalCode: string | null;
    Country: string | null;
    Phone: string | null;
    Fax: string | null;
    HomePage: string | null;
}

export interface Category {
    CategoryID: number;
    CategoryName: string;
    Description: string | null;
}

export interface Shipper {
    ShipperID: number;
    CompanyName: string;
    Phone: string | null;
}

export interface DashboardKPIs {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    monthlyRevenue: { month: string; revenue: number }[];
    topCustomers: { name: string; revenue: number }[];
    recentOrders: Order[];
    lowStockProducts: Product[];
}
