﻿namespace Shipping_Project.DTOs
{
    public class GetAllEmployeeDTO
    {
        public string id { get; set; }

        public string Name { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string BrachName { get; set; }
        public string GroupName { get; set; }
        public bool IsDeleted { get; set; }
    }
}
