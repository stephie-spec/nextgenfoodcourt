# Seed file to populate the database with sample data.

import uuid
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash


if __name__ == "__main__":

    # Import app and dependencies
    from app import app
    from extensions import db
    from models import Owner, Customer, Outlet, Item, MenuOutletItem, Order, TableBooking, OrderStatus, Testimonial, CustomerFavourite
    

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
            name="Addis Kitchen",
            category_name="Ethiopian",
            owner_id=owner1.id,
            image_path="taj1.jpg"
        )
        outlet2 = Outlet(
            name="Lagos Grill",
            category_name="Nigerian",
            owner_id=owner2.id,
            image_path="taj2.jpg"
        )
        outlet3 = Outlet(
            name="Cairo Eats",
            category_name="Egyptian",
            owner_id=owner3.id,
            image_path="taj3.jpg"
        )

        db.session.add_all([outlet1, outlet2, outlet3])
        db.session.commit()

        # Create additional diverse outlets
        outlet4 = Outlet(
            name="Nairobi Bites",
            category_name="Kenyan",
            owner_id=owner1.id,
            image_path="taj4.jpg"
        )
        outlet5 = Outlet(
            name="Cape Town Kitchen",
            category_name="South African",
            owner_id=owner2.id,
            image_path="taj5.jpg"
        )
        outlet6 = Outlet(
            name="Kinsasha Flavors",
            category_name="Congolese",
            owner_id=owner3.id,
            image_path="taj6.jpg"
        )
        outlet7 = Outlet(
            name="Zanzibari Spice House",
            category_name="Zanzibari",
            owner_id=owner1.id,
            image_path="taj7.jpg"
        )
        outlet8 = Outlet(
            name="Kilimanjaro Bites",
            category_name="Tanzanian",
            owner_id=owner2.id,
            image_path="taj8.jpg"
        )
        outlet9 = Outlet(
            name="Cairo Eats",
            category_name="Egyptian",
            owner_id=owner3.id,
            image_path="taj9.jpg"
        )

        db.session.add_all([outlet4, outlet5, outlet6, outlet7, outlet8, outlet9])
        db.session.commit()

        # Create sample items
        print("Creating menu items...")

        ethiopian_items = [
            Item(name="Doro Wat", image="taj14.jpg", price=350, description="Spicy chicken stew simmered in berbere sauce with boiled eggs", is_available=True, category_name="Stew"),
            Item(name="Injera Platter", image="taj15.jpg", price=300, description="Assorted lentils and vegetables served on traditional injera", is_available=True,category_name="Platter"),
            Item(name="Kitfo", image="taj16.jpg", price=380, description="Minced beef seasoned with butter and spices", is_available=True,category_name="Raw Meat"),
            Item(name="Tibs", image="taj17.jpg", price=360, description="Sautéed beef with onions and peppers", is_available=True,category_name="Sautéed Meat"),
        ]

        nigerian_items = [
            Item(name="Jollof Rice", image="taj10.jpg", price=250, description="Smoky Nigerian jollof with grilled chicken and plantains", is_available=True,category_name="Rice Dish"),
            Item(name="Suya Skewers", image="taj11.jpg", price=200, description="Spiced grilled beef with peanut seasoning and onions", is_available=True,category_name="Grilled Meat"),
            Item(name="Egusi Soup", image="taj12.jpg", price=280, description="Melon seed soup with assorted meat and fish",  is_available=True,category_name="Soup"),
            Item(name="Pounded Yam", image="taj13.jpg", price=220, description="Smooth pounded yam with rich vegetable soup", is_available=True,category_name="Side Dish"),
        ]

        swahili_items = [
            Item(name="Pilau Rice", image="taj18.jpg", price=220, description="Aromatic rice with spices and meat", is_available=True,category_name="Rice Dish"),
            Item(name="Biriani ya Pwani", image="taj19.jpg", price=300, description="Coastal biryani with seafood and aromatic spices", is_available=True,category_name="Rice Dish"),
            Item(name="Samaki wa Kupaka", image="taj20.jpg", price=320, description="Fish cooked in coconut milk sauce", is_available=True,category_name="Fish Dish"),
            Item(name="Viazi Karai", image="taj21.jpg", price=180, description="Crispy fried potatoes with spices", is_available=True,category_name="Side Dish"),
            Item(name="Mahamri", image="taj18.jpg", price=120, description="Sweet fried dough pastry", is_available=True,category_name="Dessert"),
        ]

        all_items = ethiopian_items + nigerian_items + swahili_items
        db.session.add_all(all_items)
        db.session.commit()

        print("Creating additional menu items...")

        kenyan_items = [
            Item(name="Nyama Choma", image="taj22.jpg", price=420, description="Roasted goat meat with ugali and kachumbari", is_available=True,category_name="Grilled Meat"),
            Item(name="Ugali & Sukuma Wiki", image="taj24.jpg", price=180, description="Collard greens sautéed with onions and tomatoes", is_available=True,category_name="Vegetables"),
            Item(name="Githeri", image="taj23.jpg", price=200, description="Boiled maize and beans with vegetables", is_available=True,category_name="Stew"),
            Item(name="Mandazi", image="taj25.jpg", price=120, description="Fried dough bread with coconut and spices", is_available=True,category_name="Dessert"),
        ]

        southafrican_items = [
            Item(name="Bobotie", image="taj26.jpg", price=340, description="Spiced minced meat topped with egg custard", is_available=True,category_name="Casserole"),
            Item(name="Bunny Chow", image="taj27.jpg", price=300, description="Curry served in a hollowed loaf of bread", is_available=True,category_name="Street Food"),
            Item(name="Boerewors", image="taj28.jpg", price=280, description="Traditional South African farmer's sausage", is_available=True,category_name="Grilled Meat"),
            Item(name="Pap & Chakalaka", image="taj29.jpg", price=200, description="Corn porridge with vegetable relish", is_available=True,category_name="Side Dish"),
            Item(name="Malva Pudding", image="taj45.jpg", price=160, description="Sweet spongy pudding with apricots", is_available=True, category_name="Dessert"),
        ]

        congolese_items = [
            Item(name="Moambe Chicken", image="taj31.jpg", price=320, description="Chicken in palm butter sauce with rice", is_available=True,category_name="Stew"),
            Item(name="Fufu & Palm Nut Soup", image="taj30.jpg", price=260, description="Cassava fufu with palm nut soup and fish", is_available=True,category_name="Traditional"),
            Item(name="Grilled Tilapia", image="taj32.jpg", price=300, description="Fresh tilapia grilled with spices and lemon", is_available=True,category_name="Grilled Fish"),
            Item(name="Kwanga", image="taj33.jpg", price=140, description="Fermented cassava bread with savory stew", is_available=True,category_name="Side Dish"),
            Item(name="Saka Saka", image="taj30.jpg", price=200, description="Spinach cooked with cassava leaves and peanut", is_available=True,category_name="Side Dish"),
        ]

        zanzibari_items = [
            Item(name="Zanzibar Pilau",image="taj34.jpg", price=260, description="Aromatic rice with cloves and cardamom", is_available=True,category_name="Rice Dish"),
            Item(name="Octopus Curry",image="taj35.jpg", price=340, description="Tender octopus in spiced coconut curry", is_available=True,category_name="Curry"),
            Item(name="Urojo Soup",image="taj36.jpg", price=200, description="Zanzibari soup with vegetables and meat", is_available=True,category_name="Soup"),
            Item(name="Coconut Bean Stew",image="taj37.jpg", price=180, description="Creamy stew with beans and coconut milk", is_available=True,category_name="Stew"),
            Item(name="Seafood Mishkaki",image="taj38.jpg", price=300, description="Grilled seafood skewers with spice rub", is_available=True,category_name="Grilled Seafood"),
        ]

        tanzanian_items = [
            Item(name="Ugali & Beef Stew",image="taj39.jpg", price=240, description="Corn porridge with rich beef stew", is_available=True,category_name="Stew"),
            Item(name="Ndizi Nyama",image="taj40.jpg", price=280, description="Plantains with grilled meat and onions", is_available=True,category_name="Grilled Meat"),
            Item(name="Mchuzi wa Samaki",image="taj41.jpg", price=260, description="Fish in tomato and spice sauce", is_available=True,category_name="Stew"),
            Item(name="Chapati", image="taj42.jpg", price=100, description="Flatbread cooked with butter and spices", is_available=True,category_name="Bread"),
            Item(name="Chips Mayai",image="taj43.jpg", price=180, description="Fried potatoes with scrambled eggs", is_available=True,category_name="Side Dish"),
        ]

        egyptian_items = [
            Item(name="Koshari", image="taj18.jpg", price=220, description="Egyptian comfort food with rice, lentils, and pasta", is_available=True,category_name="Street Food"),
            Item(name="Shawarma", image="taj19.jpg", price=240, description="Slow-roasted meat with tahini and pickles in pita", is_available=True,category_name="Street Food"),
            Item(name="Falafel", image="taj20.jpg", price=180, description="Crispy chickpea fritters with tahini sauce", is_available=True,category_name="Street Food"),
            Item(name="Molokhia", image="taj21.jpg", price=260, description="Jute leaf soup with rabbit and rice", is_available=True,category_name="Soup"),
            Item(name="Feteer Meshaltet", image="taj44.jpg", price=200, description="Flaky pastry layered with honey and cheese", is_available=True,category_name="Pastry"),
        ]

        additional_items = (
            kenyan_items
            + southafrican_items
            + congolese_items
            + zanzibari_items
            + tanzanian_items
            + egyptian_items
        )

        db.session.add_all(additional_items)
        db.session.commit()

        # Adding new items to the existing all_items list for easier reference.
        all_items.extend(additional_items)

        # Link items to outlets
        print("Creating menu outlet items...")
        menu_items = []

        for item in ethiopian_items:
            menu_items.append(MenuOutletItem(outlet_id=outlet1.id, item_id=item.id))

        for item in nigerian_items:
            menu_items.append(MenuOutletItem(outlet_id=outlet2.id, item_id=item.id))

        for item in egyptian_items:
            menu_items.append(MenuOutletItem(outlet_id=outlet3.id, item_id=item.id))

        for item in kenyan_items:
            menu_items.append(MenuOutletItem(outlet_id=outlet4.id, item_id=item.id))

        for item in southafrican_items:
            menu_items.append(MenuOutletItem(outlet_id=outlet5.id, item_id=item.id))

        for item in congolese_items:
            menu_items.append(MenuOutletItem(outlet_id=outlet6.id, item_id=item.id))

        for item in zanzibari_items:
            menu_items.append(MenuOutletItem(outlet_id=outlet7.id, item_id=item.id))

        for item in tanzanian_items:
            menu_items.append(MenuOutletItem(outlet_id=outlet8.id, item_id=item.id))

        for item in egyptian_items:
            menu_items.append(MenuOutletItem(outlet_id=outlet9.id, item_id=item.id))

        db.session.add_all(menu_items)
        db.session.commit()

        print("\n✅ Database seeded successfully!")


        
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

        # Create sample testimonials
        print("Creating testimonials...")
        
        testimonials = [
             Testimonial(
        id=str(uuid.uuid4()),
        outlet_id=outlet1.id,  # Ethiopian
        customer_name="Emily Chen",
        avatar="avatar-emily.jpg",
        rating=5,
        review_text="The Doro Wat was rich, spicy, and incredibly authentic. Injera was fresh and perfect!",
        created_at=now - timedelta(days=5)
    ),
    Testimonial(
        id=str(uuid.uuid4()),
        outlet_id=outlet1.id,
        customer_name="Michael Brown",
        avatar="avatar-michael.jpg",
        rating=4,
        review_text="Loved the Injera platter and tibs. Great flavors, would definitely order again.",
        created_at=now - timedelta(days=3)
    ),
    Testimonial(
        id=str(uuid.uuid4()),
        outlet_id=outlet2.id,  # Nigerian
        customer_name="Sofia Rodriguez",
        avatar="avatar-sofia.jpg",
        rating=5,
        review_text="Best Jollof Rice I've had in a long time! The suya was perfectly spiced.",
        created_at=now - timedelta(days=7)
    ),
    Testimonial(
        id=str(uuid.uuid4()),
        outlet_id=outlet2.id,
        customer_name="David Kim",
        avatar="avatar-david.jpg",
        rating=5,
        review_text="Amazing Nigerian food. Egusi soup was thick, flavorful, and filling.",
        created_at=now - timedelta(days=2)
    ),
    Testimonial(
        id=str(uuid.uuid4()),
        outlet_id=outlet3.id,  # Swahili
        customer_name="Lisa Wang",
        avatar="avatar-lisa.jpg",
        rating=4,
        review_text="The Swahili biriani and pilau were aromatic and delicious. Loved the coastal flavors.",
        created_at=now - timedelta(days=4)
    ),
    Testimonial(
        id=str(uuid.uuid4()),
        outlet_id=outlet4.id,  # Kenyan
        customer_name="James Wilson",
        avatar="avatar-james.jpg",
        rating=5,
        review_text="Nyama Choma was grilled to perfection. Authentic Kenyan taste!",
        created_at=now - timedelta(days=1)
    ),
    Testimonial(
        id=str(uuid.uuid4()),
        outlet_id=outlet5.id,  # South African
        customer_name="Isabella Rossi",
        avatar="avatar-isabella.jpg",
        rating=5,
        review_text="The bobotie was comforting and delicious. Malva pudding was a perfect finish.",
        created_at=now - timedelta(days=6)
    ),
    Testimonial(
        id=str(uuid.uuid4()),
        outlet_id=outlet6.id,  # Congolese
        customer_name="Yuki Tanaka",
        avatar="avatar-yuki.jpg",
        rating=4,
        review_text="Moambe chicken was rich and hearty. Loved discovering Congolese cuisine here.",
        created_at=now - timedelta(days=3)
    ),
    Testimonial(
        id=str(uuid.uuid4()),
        outlet_id=outlet7.id,  # Zanzibari
        customer_name="Ahmed Hassan",
        avatar="avatar-ahmed.jpg",
        rating=5,
        review_text="The octopus curry and Zanzibar pilau were bursting with flavor. Highly recommended!",
        created_at=now - timedelta(days=2)
    ),
    Testimonial(
        id=str(uuid.uuid4()),
        outlet_id=outlet9.id,  # Egyptian
        customer_name="Noura El-Sayed",
        avatar="avatar-noura.jpg",
        rating=5,
        review_text="Koshari was comforting and perfectly balanced. Felt like home!",
        created_at=now - timedelta(days=1)
    ),
        ]
        
        db.session.add_all(testimonials)
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

        # Create sample customer favourites
        print("Creating customer favourites...")
        
        # Add some items to customer1's favourites
        customer1.favourites.append(CustomerFavourite(item_id=all_items[38].id))  # Shawarma
        customer1.favourites.append(CustomerFavourite(item_id=all_items[4].id))  # Jollof Rice
        customer1.favourites.append(CustomerFavourite(item_id=all_items[22].id))  # Moambe Chicken
        
        # Add some items to customer2's favourites
        customer2.favourites.append(CustomerFavourite(item_id=all_items[38].id))  # Shawarma
        customer2.favourites.append(CustomerFavourite(item_id=all_items[5].id))  # Suya Skewers
        customer2.favourites.append(CustomerFavourite(item_id=all_items[13].id))  # Nyama Choma
        
        # Add some items to customer3's favourites
        customer3.favourites.append(CustomerFavourite(item_id=all_items[2].id))  # Kitfo
        customer3.favourites.append(CustomerFavourite(item_id=all_items[38].id))  # Shawarma
        customer3.favourites.append(CustomerFavourite(item_id=all_items[13].id))  # Nyama Choma
        
        db.session.commit()

