
# Seed file to populate the database with sample data.


from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash


if __name__ == "__main__":

    # Import app and dependencies
    from app import app
    from extensions import db
    from models import Owner, Customer, Outlet, Item, MenuOutletItem, Order, TableBooking, OrderStatus
    

    with app.app_context():

        # Drop all tables and recreate them

        print("Dropping existing tables...")
        db.drop_all()
        
        print("Creating tables...")
        db.create_all()
        

        # Create sample owners
        
        print("Creating owners...")
        owner1 = Owner(
            name="Raj Patel",
            email="raj.patel@foodcourt.com",
            password_hashed=generate_password_hash("owner123")
        )
        owner2 = Owner(
            name="Maria Garcia",
            email="maria.garcia@foodcourt.com",
            password_hashed=generate_password_hash("owner456")
        )
        owner3 = Owner(
            name="Chen Wei",
            email="chen.wei@foodcourt.com",
            password_hashed=generate_password_hash("owner789")
        )
        
        db.session.add_all([owner1, owner2, owner3])
        db.session.commit()


        
        # Create sample outlets

        print("Creating outlets...")
        outlet1 = Outlet(
            name="Taj Express",
            category_name="Indian",
            owner_id=owner1.id,
            image_path = "taj1.jpg"
        
        )
        outlet2 = Outlet(
            name="El Sabor",
            category_name="Mexican",
            owner_id=owner2.id,
            image_path = "taj2.jpg"
        )
        outlet3 = Outlet(
            name="Dragon Palace",
            category_name="Chinese",
            owner_id=owner3.id,
            image_path = "taj3.jpg"
        )
        
        db.session.add_all([outlet1, outlet2, outlet3])
        db.session.commit()
        


        # Create additional diverse outlets

        outlet4 = Outlet(
            name="Burger Barn",
            category_name="American",
            owner_id=owner1.id,
            image_path = "taj4.jpg"
        )
        outlet5 = Outlet(
            name="Pasta Primo",
            category_name="Italian",
            owner_id=owner2.id,
            image_path = "taj5.jpg"
        )
        outlet6 = Outlet(
            name="Sushi Sensation",
            category_name="Japanese",
            owner_id=owner3.id,
            image_path = "taj6.jpg"
        )
        outlet7 = Outlet(
            name="Pita Palace",
            category_name="Mediterranean",
            owner_id=owner1.id,
            image_path = "taj7.jpg"
        )
        outlet8 = Outlet(
            name="Thai Kitchen",
            category_name="Thai",
            owner_id=owner2.id,
            image_path = "taj8.jpg"
        )
        outlet9 = Outlet(
            name="Korean BBQ House",
            category_name="Korean",
            owner_id=owner3.id,
            image_path = "taj9.jpg"
        
        )
        
        db.session.add_all([outlet4, outlet5, outlet6, outlet7, outlet8, outlet9])
        db.session.commit()
        


        # Create sample items for Indian restaurant

        print("Creating menu items...")
        indian_items = [
            Item(
                name="Butter Chicken",
                image="butter_chicken.jpg",
                price=350,
                is_available=True
            ),
            Item(
                name="Biryani",
                image="biryani.jpg",
                price=300,
                is_available=True
            ),
            Item(
                name="Naan",
                image="naan.jpg",
                price=50,
                is_available=True
            ),
            Item(
                name="Samosa",
                image="samosa.jpg",
                price=40,
                is_available=True
            ),
            Item(
                name="Mango Lassi",
                image="mango_lassi.jpg",
                price=80,
                is_available=True
            ),
        ]
        
        # Create sample items for Mexican restaurant
        mexican_items = [
            Item(
                name="Burrito",
                image="burrito.jpg",
                price=250,
                is_available=True
            ),
            Item(
                name="Tacos",
                image="tacos.jpg",
                price=200,
                is_available=True
            ),
            Item(
                name="Enchiladas",
                image="enchiladas.jpg",
                price=280,
                is_available=True
            ),
            Item(
                name="Guacamole",
                image="guacamole.jpg",
                price=120,
                is_available=True
            ),
            Item(
                name="Churros",
                image="churros.jpg",
                price=100,
                is_available=True
            ),
        ]
        
        # Create sample items for Chinese restaurant

        chinese_items = [
            Item(
                name="Fried Rice",
                image="fried_rice.jpg",
                price=200,
                is_available=True
            ),
            Item(
                name="Kung Pao Chicken",
                image="kung_pao.jpg",
                price=320,
                is_available=True
            ),
            Item(
                name="Spring Rolls",
                image="spring_rolls.jpg",
                price=120,
                is_available=True
            ),
            Item(
                name="Chow Mein",
                image="chow_mein.jpg",
                price=240,
                is_available=True
            ),
            Item(
                name="Green Tea",
                image="green_tea.jpg",
                price=60,
                is_available=True
            ),
        ]
        
        all_items = indian_items + mexican_items + chinese_items
        db.session.add_all(all_items)
        db.session.commit()
        
        # Create items for American restaurant

        print("Creating additional menu items...")
        american_items = [
            Item(
                name="Classic Burger",
                image="burger.jpg",
                price=280,
                is_available=True
            ),
            Item(
                name="Cheese Fries",
                image="fries.jpg",
                price=120,
                is_available=True
            ),
            Item(
                name="Hot Dog",
                image="hotdog.jpg",
                price=150,
                is_available=True
            ),
            Item(
                name="Chicken Sandwich",
                image="chicken_sandwich.jpg",
                price=260,
                is_available=True
            ),
            Item(
                name="Milkshake",
                image="milkshake.jpg",
                price=100,
                is_available=True
            ),
        ]
        
        # Italian items

        italian_items = [
            Item(
                name="Spaghetti Carbonara",
                image="carbonara.jpg",
                price=350,
                is_available=True
            ),
            Item(
                name="Lasagna",
                image="lasagna.jpg",
                price=380,
                is_available=True
            ),
            Item(
                name="Fettuccine Alfredo",
                image="alfredo.jpg",
                price=340,
                is_available=True
            ),
            Item(
                name="Penne Arrabbiata",
                image="arrabbiata.jpg",
                price=320,
                is_available=True
            ),
            Item(
                name="Tiramisu",
                image="tiramisu.jpg",
                price=140,
                is_available=True
            ),
        ]
        
        # Japanese items

        japanese_items = [
            Item(
                name="California Roll",
                image="california_roll.jpg",
                price=280,
                is_available=True
            ),
            Item(
                name="Spicy Tuna Roll",
                image="spicy_tuna.jpg",
                price=320,
                is_available=True
            ),
            Item(
                name="Tempura",
                image="tempura.jpg",
                price=300,
                is_available=True
            ),
            Item(
                name="Edamame",
                image="edamame.jpg",
                price=100,
                is_available=True
            ),
            Item(
                name="Miso Soup",
                image="miso_soup.jpg",
                price=80,
                is_available=True
            ),
        ]
        
        # Mediterranean items

        mediterranean_items = [
            Item(
                name="Falafel Wrap",
                image="falafel_wrap.jpg",
                price=200,
                is_available=True
            ),
            Item(
                name="Hummus & Pita",
                image="hummus_pita.jpg",
                price=120,
                is_available=True
            ),
            Item(
                name="Greek Salad",
                image="greek_salad.jpg",
                price=180,
                is_available=True
            ),
            Item(
                name="Shawarma",
                image="shawarma.jpg",
                price=220,
                is_available=True
            ),
            Item(
                name="Baklava",
                image="baklava.jpg",
                price=90,
                is_available=True
            ),
        ]
        
        # Thai items

        thai_items = [
            Item(
                name="Pad Thai",
                image="pad_thai.jpg",
                price=280,
                is_available=True
            ),
            Item(
                name="Green Curry",
                image="green_curry.jpg",
                price=320,
                is_available=True
            ),
            Item(
                name="Tom Yum Soup",
                image="tom_yum.jpg",
                price=200,
                is_available=True
            ),
            Item(
                name="Satay Chicken",
                image="satay.jpg",
                price=240,
                is_available=True
            ),
            Item(
                name="Mango Sticky Rice",
                image="mango_sticky.jpg",
                price=120,
                is_available=True
            ),
        ]
        
        # Korean items

        korean_items = [
            Item(
                name="Bulgogi",
                image="bulgogi.jpg",
                price=340,
                is_available=True
            ),
            Item(
                name="Bibimbap",
                image="bibimbap.jpg",
                price=300,
                is_available=True
            ),
            Item(
                name="Korean Fried Chicken",
                image="korean_fried_chicken.jpg",
                price=360,
                is_available=True
            ),
            Item(
                name="Kimchi",
                image="kimchi.jpg",
                price=80,
                is_available=True
            ),
            Item(
                name="Tteokbokki",
                image="tteokbokki.jpg",
                price=150,
                is_available=True
            ),
        ]
        
        additional_items = american_items + italian_items + japanese_items + mediterranean_items + thai_items + korean_items
        db.session.add_all(additional_items)
        db.session.commit()

        
        # Link items to outlets
        print("Creating menu outlet items...")
        menu_items = []
        
        # Indian outlet menu
        for item in indian_items:
            menu_items.append(MenuOutletItem(outlet_id=outlet1.id, item_id=item.id))
        
        # Mexican outlet menu
        for item in mexican_items:
            menu_items.append(MenuOutletItem(outlet_id=outlet2.id, item_id=item.id))
        
        # Chinese outlet menu
        for item in chinese_items:
            menu_items.append(MenuOutletItem(outlet_id=outlet3.id, item_id=item.id))
        
        # American outlet menu
        for item in american_items:
            menu_items.append(MenuOutletItem(outlet_id=outlet4.id, item_id=item.id))
        
        # Italian outlet menu
        for item in italian_items:
            menu_items.append(MenuOutletItem(outlet_id=outlet5.id, item_id=item.id))
        
        # Japanese outlet menu
        for item in japanese_items:
            menu_items.append(MenuOutletItem(outlet_id=outlet6.id, item_id=item.id))
        
        # Mediterranean outlet menu
        for item in mediterranean_items:
            menu_items.append(MenuOutletItem(outlet_id=outlet7.id, item_id=item.id))
        
        # Thai outlet menu
        for item in thai_items:
            menu_items.append(MenuOutletItem(outlet_id=outlet8.id, item_id=item.id))
        
        # Korean outlet menu
        for item in korean_items:
            menu_items.append(MenuOutletItem(outlet_id=outlet9.id, item_id=item.id))
        
        db.session.add_all(menu_items)
        db.session.commit()


        
        # Create sample customers
        print("Creating customers...")
        customer1 = Customer(
            name="John Smith",
            email="john.smith@email.com",
            password_hashed=generate_password_hash("customer123")
        )
        customer2 = Customer(
            name="Sarah Johnson",
            email="sarah.johnson@email.com",
            password_hashed=generate_password_hash("customer456")
        )
        customer3 = Customer(
            name="Amit Kumar",
            email="amit.kumar@email.com",
            password_hashed=generate_password_hash("customer789")
        )
        
        db.session.add_all([customer1, customer2, customer3])
        db.session.commit()
        


        # Create sample orders
        print("Creating orders...")
        now = datetime.utcnow()
        
        # Order 1: John ordering Butter Chicken
        order1 = Order(
            menu_outlet_item_id=menu_items[0].id,
            customer_id=customer1.id,
            quantity=2,
            status=OrderStatus.completed,
            created_at=now - timedelta(hours=2),
            estimated=now - timedelta(hours=1, minutes=45)
        )
        
        # Order 2: Sarah ordering Tacos
        order2 = Order(
            menu_outlet_item_id=menu_items[5].id,
            customer_id=customer2.id,
            quantity=1,
            status=OrderStatus.pending,
            created_at=now - timedelta(minutes=15),
            estimated=now + timedelta(minutes=30)
        )
        
        # Order 3: Amit ordering Fried Rice
        order3 = Order(
            menu_outlet_item_id=menu_items[10].id,
            customer_id=customer3.id,
            quantity=3,
            status=OrderStatus.pending,
            created_at=now - timedelta(minutes=5),
            estimated=now + timedelta(minutes=25)
        )
        
        # Order 4: John ordering Biryani
        order4 = Order(
            menu_outlet_item_id=menu_items[1].id,
            customer_id=customer1.id,
            quantity=1,
            status=OrderStatus.completed,
            created_at=now - timedelta(days=1),
            estimated=now - timedelta(days=1, minutes=-45)
        )
        
        db.session.add_all([order1, order2, order3, order4])
        db.session.commit()
        

        
        # Create sample table bookings
        print("Creating table bookings...")
        booking1 = TableBooking(
            order_id=order1.id,
            table_number=5,
            capacity=4,
            created_at=now - timedelta(hours=2),
            duration=timedelta(hours=1, minutes=30)
        )
        
        booking2 = TableBooking(
            order_id=order2.id,
            table_number=3,
            capacity=2,
            created_at=now - timedelta(minutes=15),
            duration=timedelta(minutes=45)
        )
        
        db.session.add_all([booking1, booking2])
        db.session.commit()
        
        print("\n✅ Database seeded successfully!")
        print("\n📊 Summary:")
        print(f"  - Owners created: {Owner.query.count()}")
        print(f"  - Outlets created: {Outlet.query.count()}")
        print(f"  - Items created: {Item.query.count()}")
        print(f"  - Menu items linked: {MenuOutletItem.query.count()}")
        print(f"  - Customers created: {Customer.query.count()}")
        print(f"  - Orders created: {Order.query.count()}")
        print(f"  - Table bookings created: {TableBooking.query.count()}")
        print("\n🔑 Test Credentials:")
        print("  Owners:")
        print("    - raj.patel@foodcourt.com / owner123")
        print("    - maria.garcia@foodcourt.com / owner456")
        print("    - chen.wei@foodcourt.com / owner789")
        print("  Customers:")
        print("    - john.smith@email.com / customer123")
        print("    - sarah.johnson@email.com / customer456")
        print("    - amit.kumar@email.com / customer789")
