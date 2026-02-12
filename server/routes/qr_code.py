import qrcode
import io
import base64
from flask import request, jsonify, send_file
from flask_restful import Resource

class QRCodeResource(Resource):
    """Generate QR codes for orders, payments, or any data"""
    
    def post(self):
        """
        Generate a QR code from provided data
        
        Expected JSON body:
        {
            "data": "Order-12345" or "payment-ref-xyz" or any string,
            "size": 10 (optional, default is 10),
            "border": 4 (optional, default is 4)
        }
        
        Returns:
        {
            "qr": "data:image/png;base64,iVBORw0KG...",
            "data": "Order-12345"
        }
        """
        try:
            data = request.json
            
            if not data or 'data' not in data:
                return {'error': 'No data provided for QR code generation'}, 400
            
            qr_data = data.get('data')
            qr_size = data.get('size', 10)  # Box size for each module
            qr_border = data.get('border', 4)  # Border in modules
            
            # Create QR code instance
            qr = qrcode.QRCode(
                version=1,  # Auto-adjust version based on data length
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=qr_size,
                border=qr_border,
            )
            
            # Add data and generate QR code
            qr.add_data(qr_data)
            qr.make(fit=True)
            
            # Create image
            img = qr.make_image(fill_color="black", back_color="white")
            
            # Save to BytesIO buffer
            buffer = io.BytesIO()
            img.save(buffer, format="PNG")
            buffer.seek(0)
            
            # Convert to base64
            base64_qr = base64.b64encode(buffer.getvalue()).decode("utf-8")
            
            return {
                'qr': f"data:image/png;base64,{base64_qr}",
                'data': qr_data
            }, 200
            
        except Exception as e:
            return {'error': f'Failed to generate QR code: {str(e)}'}, 500


class OrderQRCodeResource(Resource):
    """Generate QR code specifically for order tracking"""
    
    def post(self, order_id):
        """
        Generate a QR code for a specific order
        
        Path parameter:
        - order_id: The order ID to encode
        
        Optional JSON body:
        {
            "include_details": true,  # Include more order info in QR
            "base_url": "http://localhost:3000"  # For generating tracking URL
        }
        
        Returns:
        {
            "qr": "data:image/png;base64,iVBORw0KG...",
            "order_id": 123,
            "qr_data": "encoded string or URL"
        }
        """
        try:
            data = request.json or {}
            base_url = data.get('base_url', 'http://localhost:3000')
            include_details = data.get('include_details', False)
            
            # Generate QR data
            if include_details:
                # Create a tracking URL that customer can scan
                qr_data = f"{base_url}/track-order/{order_id}"
            else:
                # Simple order ID encoding
                qr_data = f"ORDER-{order_id}"
            
            # Create QR code
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_M,
                box_size=10,
                border=4,
            )
            
            qr.add_data(qr_data)
            qr.make(fit=True)
            
            img = qr.make_image(fill_color="black", back_color="white")
            
            buffer = io.BytesIO()
            img.save(buffer, format="PNG")
            buffer.seek(0)
            
            base64_qr = base64.b64encode(buffer.getvalue()).decode("utf-8")
            
            return {
                'qr': f"data:image/png;base64,{base64_qr}",
                'order_id': order_id,
                'qr_data': qr_data
            }, 200
            
        except Exception as e:
            return {'error': f'Failed to generate order QR code: {str(e)}'}, 500


class PaymentQRCodeResource(Resource):
    """Generate QR code for payment references"""
    
    def post(self):
        """
        Generate a QR code for payment
        
        Expected JSON body:
        {
            "order_id": 123,
            "amount": 1500.00,
            "payment_method": "mpesa",
            "reference": "PAY-XYZ-123"
        }
        
        Returns:
        {
            "qr": "data:image/png;base64,iVBORw0KG...",
            "payment_reference": "PAY-XYZ-123"
        }
        """
        try:
            data = request.json
            
            if not data:
                return {'error': 'No payment data provided'}, 400
            
            order_id = data.get('order_id')
            amount = data.get('amount')
            payment_method = data.get('payment_method', 'cash')
            reference = data.get('reference', f"PAY-{order_id}")
            
            # Create payment QR data (can be customized for M-Pesa, card, etc.)
            qr_data = f"{reference}|ORDER:{order_id}|AMOUNT:{amount}|METHOD:{payment_method}"
            
            # Generate QR code
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_H,  # Higher error correction for payment
                box_size=10,
                border=4,
            )
            
            qr.add_data(qr_data)
            qr.make(fit=True)
            
            img = qr.make_image(fill_color="black", back_color="white")
            
            buffer = io.BytesIO()
            img.save(buffer, format="PNG")
            buffer.seek(0)
            
            base64_qr = base64.b64encode(buffer.getvalue()).decode("utf-8")
            
            return {
                'qr': f"data:image/png;base64,{base64_qr}",
                'payment_reference': reference,
                'order_id': order_id,
                'amount': amount
            }, 200
            
        except Exception as e:
            return {'error': f'Failed to generate payment QR code: {str(e)}'}, 500


class HomePageQRResource(Resource):
    """Generate a QR code for the homepage URL"""
    
    def get(self):
        """
        Generate a QR code that links to the homepage
        Returns PNG image directly
        
        Optional query params:
        - url: Custom URL (default: http://localhost:3000)
        - format: 'image' for PNG or 'json' for base64 (default: image)
        """
        try:
            # Get URL from query params or use default
            homepage_url = request.args.get('url', 'http://localhost:3000')
            response_format = request.args.get('format', 'image')
            
            # Create QR code
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_M,
                box_size=10,
                border=4,
            )
            
            qr.add_data(homepage_url)
            qr.make(fit=True)
            
            img = qr.make_image(fill_color="black", back_color="white")
            
            buffer = io.BytesIO()
            img.save(buffer, format="PNG")
            buffer.seek(0)
            
            # Return as image or JSON based on format param
            if response_format == 'json':
                base64_qr = base64.b64encode(buffer.getvalue()).decode("utf-8")
                return {
                    'qr': f"data:image/png;base64,{base64_qr}",
                    'url': homepage_url
                }, 200
            else:
                return send_file(
                    buffer,
                    mimetype='image/png',
                    as_attachment=False,
                    download_name='homepage-qr.png'
                )
            
        except Exception as e:
            return {'error': f'Failed to generate homepage QR code: {str(e)}'}, 500
