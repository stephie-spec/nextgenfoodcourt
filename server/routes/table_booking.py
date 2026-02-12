from datetime import datetime, timedelta

from flask import request
from flask_restful import Resource

from extensions import db
from models import TableBooking, Order, Customer, MenuOutletItem, BookingStatus


class TableBookingListResource(Resource):
    """List and create table bookings"""

    def get(self):
        try:
            bookings = TableBooking.query.all()
            return [
                {
                    'id': booking.id,
                    'order_id': booking.order_id,
                    'table_number': booking.table_number,
                    'capacity': booking.capacity,
                    'created_at': booking.created_at.isoformat() if booking.created_at else None,
                    'duration': str(booking.duration) if booking.duration else None,
                }
                for booking in bookings
            ], 200
        except Exception as e:
            return {'error': str(e)}, 500

    def post(self):
        """Create a new table booking with associated order"""
        try:
            data = request.get_json() or {}

            required_fields = ['customer_id', 'menu_outlet_item_id', 'table_number', 'capacity', 'quantity']
            for field in required_fields:
                if field not in data:
                    return {'error': f'Missing required field: {field}'}, 400

            customer = Customer.query.get(data['customer_id'])
            if not customer:
                return {'error': 'Customer not found'}, 404

            menu_item = MenuOutletItem.query.get(data['menu_outlet_item_id'])
            if not menu_item:
                return {'error': 'Menu item not found'}, 404

            table_number = data['table_number']
            duration_hours = data.get('duration_hours', 2)

            booking_datetime = None
            if data.get('booking_date') and data.get('booking_time'):
                try:
                    booking_datetime = datetime.fromisoformat(f"{data['booking_date']}T{data['booking_time']}")
                except:
                    booking_datetime = datetime.utcnow() + timedelta(hours=1)

            order = Order(
                menu_outlet_item_id=data['menu_outlet_item_id'],
                customer_id=data['customer_id'],
                quantity=data['quantity'],
                estimated=datetime.utcnow() + timedelta(minutes=30),
            )
            db.session.add(order)
            db.session.flush()

            booking = TableBooking(
                order_id=order.id,
                table_number=table_number,
                capacity=data['capacity'],
                duration=timedelta(hours=duration_hours),
                status=BookingStatus.pending,
                booking_date=booking_datetime or datetime.utcnow() + timedelta(hours=1),
                special_requests=data.get('special_requests', '')
            )

            db.session.add(booking)
            db.session.commit()

            return {
                'message': 'Table booking created successfully',
                'booking': {
                    'id': booking.id,
                    'table_number': booking.table_number,
                    'capacity': booking.capacity,
                    'status': booking.status.value,  
                    'created_at': booking.created_at.isoformat() if booking.created_at else None,
                    'booking_date': booking.booking_date.isoformat() if booking.booking_date else None,
                    'duration': str(booking.duration) if booking.duration else None,
                    'order_id': booking.order_id,
                },
            }, 201

        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500


class TableBookingResource(Resource):
    """Retrieve, update, or delete a booking"""

    def get(self, booking_id):
        try:
            booking = TableBooking.query.get_or_404(booking_id)
            return {
                'id': booking.id,
                'order_id': booking.order_id,
                'table_number': booking.table_number,
                'capacity': booking.capacity,
                'created_at': booking.created_at.isoformat() if booking.created_at else None,
                'duration': str(booking.duration) if booking.duration else None,
                'order': {
                    'id': booking.order.id,
                    'status': booking.order.status.value if booking.order.status else None,
                    'quantity': booking.order.quantity,
                } if booking.order else None,
            }, 200
        except Exception as e:
            return {'error': str(e)}, 404

    def put(self, booking_id):
        try:
            booking = TableBooking.query.get_or_404(booking_id)
            data = request.get_json() or {}

            if 'table_number' in data:
                booking.table_number = data['table_number']
            if 'capacity' in data:
                booking.capacity = data['capacity']
            if 'duration_hours' in data:
                booking.duration = timedelta(hours=data['duration_hours'])

            if 'booking_date' in data and 'booking_time' in data:
                try:
                    booking.booking_date = datetime.fromisoformat(f"{data['booking_date']}T{data['booking_time']}")
                except:
                    pass
            if 'special_requests' in data:
                booking.special_requests = data['special_requests']
        
            if 'status' in data:
                try:
                    booking.status = BookingStatus(data['status'])
                except ValueError:
                    return {'error': f"Invalid status. Must be one of: {[s.value for s in BookingStatus]}"}, 400
            
                if booking.status == BookingStatus.cancelled and booking.order:
                    from models import OrderStatus
                    booking.order.status = OrderStatus.cancelled

            db.session.commit()

            return {
                'message': 'Booking updated successfully',
                'booking': {
                    'id': booking.id,
                    'table_number': booking.table_number,
                    'status': booking.status.value,
                    'capacity': booking.capacity,
                    'booking_date': booking.booking_date.isoformat() if booking.booking_date else None,
                    'duration': str(booking.duration) if booking.duration else None,
                },
            }, 200
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500

    def delete(self, booking_id):
        try:
            booking = TableBooking.query.get_or_404(booking_id)
            db.session.delete(booking)
            db.session.commit()
            return {'message': 'Booking cancelled successfully'}, 200
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500


class AvailableTablesResource(Resource):
    """Get list of available tables"""

    def get(self):
        try:
            active_bookings = TableBooking.query.all()
            booked_tables = [b.table_number for b in active_bookings]

            all_tables = list(range(1, 21))
            available_tables = [t for t in all_tables if t not in booked_tables]

            return {
                'available_tables': available_tables,
                'booked_tables': booked_tables,
                'total_tables': len(all_tables),
            }, 200

        except Exception as e:
            return {'error': str(e)}, 500

class CustomerTableBookingsResource(Resource):
    """Get all bookings for a specific customer"""
    
    def get(self, customer_id):
        try:
            # Import here if not at top
            from models import BookingStatus
            
            # First get all orders for this customer
            customer_orders = Order.query.filter_by(customer_id=customer_id).all()
            order_ids = [order.id for order in customer_orders]
            
            if not order_ids:
                return [], 200
                
            # Then get bookings for those orders
            bookings = TableBooking.query.filter(TableBooking.order_id.in_(order_ids)).all()
            
            return [
                {
                    'id': booking.id,
                    'order_id': booking.order_id,
                    'table_number': booking.table_number,
                    'capacity': booking.capacity,
                    'status': booking.status.value if booking.status else 'pending',
                    'created_at': booking.created_at.isoformat() if booking.created_at else None,
                    'booking_date': booking.booking_date.isoformat() if booking.booking_date else None,
                    'duration': str(booking.duration) if booking.duration else None,
                    'special_requests': booking.special_requests,
                    'outlet_name': booking.order.menu_outlet_item.outlet.name if booking.order and booking.order.menu_outlet_item else None,
                    'outlet_id': booking.order.menu_outlet_item.outlet.id if booking.order and booking.order.menu_outlet_item else None,
                    'items': [
                        {
                            'name': booking.order.menu_outlet_item.item.name,
                            'quantity': booking.order.quantity,
                            'price': booking.order.menu_outlet_item.item.price
                        }
                    ] if booking.order and booking.order.menu_outlet_item else []
                }
                for booking in bookings
            ], 200
            
        except Exception as e:
            return {'error': str(e)}, 500

